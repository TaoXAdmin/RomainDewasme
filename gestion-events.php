<?php
session_start();
date_default_timezone_set('Europe/Paris');

const REPO = 'TaoXAdmin/RomainDewasme';
const FILE_PATH = 'data/events.json';
const BRANCH = 'main';

function e($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function configuredUser() {
    return getenv('EVENTS_U') ?: 'admin';
}

function configuredKey() {
    return getenv('EVENTS_P') ?: '';
}

function ghToken() {
    return getenv('GH_TOKEN') ?: (getenv('GITHUB_TOKEN') ?: '');
}

function apiPath($path) {
    return implode('/', array_map('rawurlencode', explode('/', $path)));
}

function gh($method, $url, $payload = null) {
    $token = ghToken();
    if ($token === '') {
        throw new RuntimeException('Token GitHub manquant sur le serveur.');
    }

    $headers = [
        'Accept: application/vnd.github+json',
        'Content-Type: application/json',
        'User-Agent: Romain-Dewasme-Events',
        'X-GitHub-Api-Version: 2022-11-28',
        'Authorization: Bearer ' . $token,
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
    ]);

    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException('Erreur réseau GitHub : ' . $err);
    }

    $body = json_decode((string) $raw, true);
    return ['status' => $status, 'body' => is_array($body) ? $body : [], 'raw' => (string) $raw];
}

function loadData(&$sha = null) {
    $sha = null;
    $url = 'https://api.github.com/repos/' . REPO . '/contents/' . apiPath(FILE_PATH) . '?ref=' . rawurlencode(BRANCH);
    $res = gh('GET', $url);

    if ($res['status'] === 404) {
        return ['success' => true, 'shows' => []];
    }

    if ($res['status'] < 200 || $res['status'] >= 300) {
        throw new RuntimeException($res['body']['message'] ?? 'Lecture GitHub impossible.');
    }

    $sha = $res['body']['sha'] ?? null;
    $encoded = str_replace("\n", '', (string) ($res['body']['content'] ?? ''));
    $json = base64_decode($encoded, true);
    $data = json_decode($json ?: '{}', true);

    return is_array($data) ? $data : ['success' => true, 'shows' => []];
}

function saveData($data, $sha) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        throw new RuntimeException('JSON impossible à générer.');
    }

    $payload = [
        'message' => 'Update public events data',
        'content' => base64_encode($json . "\n"),
        'branch' => BRANCH,
    ];

    if ($sha) {
        $payload['sha'] = $sha;
    }

    $url = 'https://api.github.com/repos/' . REPO . '/contents/' . apiPath(FILE_PATH);
    $res = gh('PUT', $url, $payload);

    if ($res['status'] < 200 || $res['status'] >= 300) {
        throw new RuntimeException($res['body']['message'] ?? 'Écriture GitHub impossible.');
    }
}

function clean($value) {
    return trim((string) $value);
}

function keyFor($value) {
    return mb_strtolower(clean($value), 'UTF-8');
}

function buildDataFromPost($current) {
    $titles = $_POST['title'] ?? [];
    $dates = $_POST['date'] ?? [];
    $venues = $_POST['venue'] ?? [];
    $links = $_POST['link'] ?? [];

    $meta = [];
    foreach (($current['shows'] ?? []) as $show) {
        if (is_array($show) && !empty($show['name'])) {
            $meta[keyFor($show['name'])] = $show;
        }
    }

    $shows = [];
    $count = max(count((array) $titles), count((array) $dates), count((array) $venues), count((array) $links));

    for ($i = 0; $i < $count; $i++) {
        $title = clean($titles[$i] ?? '');
        $date = clean($dates[$i] ?? '');
        $venue = clean($venues[$i] ?? '');
        $link = clean($links[$i] ?? '');

        if ($title === '' && $date === '' && $venue === '' && $link === '') {
            continue;
        }

        if ($title === '' || $date === '' || $venue === '') {
            throw new InvalidArgumentException('Chaque ligne doit contenir un titre, une date et un lieu.');
        }

        $key = keyFor($title);
        if (!isset($shows[$key])) {
            $base = $meta[$key] ?? [];
            $shows[$key] = [
                'name' => $title,
                'poster' => $base['poster'] ?? '',
                'audience' => $base['audience'] ?? 'TOUT PUBLIC',
                'artists' => $base['artists'] ?? [],
                'teaserDesktop' => $base['teaserDesktop'] ?? '',
                'teaserMobile' => $base['teaserMobile'] ?? '',
                'events' => [],
            ];
        }

        $shows[$key]['events'][] = [
            'displayDate' => $date,
            'venue' => $venue,
            'ticketUrl' => $link,
        ];
    }

    return ['success' => true, 'updatedAt' => date(DATE_ATOM), 'shows' => array_values($shows)];
}

$errors = [];
$notice = '';
$data = ['success' => true, 'shows' => []];

try {
    if (isset($_GET['out'])) {
        $_SESSION = [];
        session_destroy();
        header('Location: gestion-events.php');
        exit;
    }

    if (($_POST['action'] ?? '') === 'in') {
        $u = clean($_POST['u'] ?? '');
        $p = (string) ($_POST['p'] ?? '');
        $expected = configuredKey();

        if ($expected !== '' && hash_equals(configuredUser(), $u) && hash_equals($expected, $p)) {
            $_SESSION['events_ok'] = true;
            header('Location: gestion-events.php');
            exit;
        }

        $errors[] = 'Accès refusé ou configuration manquante.';
    }

    if (!empty($_SESSION['events_ok'])) {
        $sha = null;
        $data = loadData($sha);

        if (($_POST['action'] ?? '') === 'save') {
            $newData = buildDataFromPost($data);
            saveData($newData, $sha);
            $data = $newData;
            $notice = 'Mise à jour validée.';
        }
    }
} catch (Throwable $ex) {
    $errors[] = $ex->getMessage();
}

$rows = [];
foreach (($data['shows'] ?? []) as $show) {
    if (!is_array($show)) continue;
    foreach (($show['events'] ?? []) as $event) {
        if (!is_array($event)) continue;
        $rows[] = [
            'title' => $show['name'] ?? '',
            'date' => $event['displayDate'] ?? ($event['date'] ?? ''),
            'venue' => $event['venue'] ?? '',
            'link' => $event['ticketUrl'] ?? '',
        ];
    }
}
if (!$rows) {
    $rows[] = ['title' => '', 'date' => '', 'venue' => '', 'link' => ''];
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Gestion events</title>
<link rel="stylesheet" href="css/main.css">
<style>
body{background:#090909;color:#fff;min-height:100vh}.wrap{width:min(1100px,calc(100% - 32px));margin:64px auto}.box{border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:28px;background:rgba(255,255,255,.06)}.grid{display:grid;gap:12px}.row{display:grid;grid-template-columns:1fr 1fr 1fr 1.2fr auto;gap:10px;align-items:end}input{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff}button,a.btn{border:0;border-radius:999px;padding:12px 18px;font-weight:800;text-decoration:none;display:inline-flex;background:#fff;color:#090909;cursor:pointer}.muted{opacity:.72}.alert{padding:12px 14px;border-radius:12px;margin:12px 0;background:rgba(255,255,255,.1)}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}@media(max-width:850px){.row{grid-template-columns:1fr;border:1px solid rgba(255,255,255,.14);padding:12px;border-radius:16px}}
</style>
</head>
<body>
<main class="wrap"><section class="box">
<h1>Gestion spectacles</h1>
<p class="muted">Mets à jour les dates, lieux et liens de billetterie.</p>
<?php foreach ($errors as $error): ?><div class="alert"><?= e($error) ?></div><?php endforeach; ?>
<?php if ($notice): ?><div class="alert"><?= e($notice) ?></div><?php endif; ?>
<?php if (empty($_SESSION['events_ok'])): ?>
<form method="post" class="grid">
<input type="hidden" name="action" value="in">
<label>Login<input name="u" autocomplete="username" required></label>
<label>Mot de passe<input name="p" type="password" autocomplete="current-password" required></label>
<div class="actions"><button type="submit">Connexion</button><a class="btn" href="actus.html">Retour</a></div>
</form>
<?php else: ?>
<form method="post" id="eventsForm">
<input type="hidden" name="action" value="save">
<div class="grid" id="rows">
<?php foreach ($rows as $row): ?>
<div class="row">
<label>Titre<input name="title[]" value="<?= e($row['title']) ?>" required></label>
<label>Date<input name="date[]" value="<?= e($row['date']) ?>" placeholder="12 octobre 2026 - 20h" required></label>
<label>Lieu<input name="venue[]" value="<?= e($row['venue']) ?>" required></label>
<label>Billetterie<input name="link[]" value="<?= e($row['link']) ?>" placeholder="https://..."></label>
<button type="button" data-remove>Supprimer</button>
</div>
<?php endforeach; ?>
</div>
<div class="actions"><button type="button" id="addRow">Ajouter une date</button><button type="submit">Valider la mise à jour</button><a class="btn" href="actus.html">Voir la page</a><a class="btn" href="?out=1">Sortir</a></div>
</form>
<?php endif; ?>
</section></main>
<template id="rowTpl"><div class="row"><label>Titre<input name="title[]" required></label><label>Date<input name="date[]" placeholder="12 octobre 2026 - 20h" required></label><label>Lieu<input name="venue[]" required></label><label>Billetterie<input name="link[]" placeholder="https://..."></label><button type="button" data-remove>Supprimer</button></div></template>
<script>
const form=document.getElementById('eventsForm');const rows=document.getElementById('rows');const add=document.getElementById('addRow');const tpl=document.getElementById('rowTpl');
if(add&&rows&&tpl){add.addEventListener('click',()=>rows.appendChild(tpl.content.cloneNode(true)));rows.addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;if(rows.querySelectorAll('.row').length<=1){b.closest('.row').querySelectorAll('input').forEach(i=>i.value='');return;}b.closest('.row').remove();});}
if(form){form.addEventListener('submit',e=>{if(!confirm('Confirmer la mise à jour de la page Spectacles ?'))e.preventDefault();});}
</script>
</body>
</html>
