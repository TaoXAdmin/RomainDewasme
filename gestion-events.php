<?php
session_start();
$uOk = getenv('EVENTS_U') ?: 'admin';
$pOk = getenv('EVENTS_P') ?: '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if (isset($_GET['out'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: gestion-events.php');
    exit;
}

if ($method === 'POST' && ($_POST['action'] ?? '') === 'in') {
    $u = trim((string)($_POST['u'] ?? ''));
    $p = (string)($_POST['p'] ?? '');
    if ($pOk !== '' && hash_equals($uOk, $u) && hash_equals($pOk, $p)) {
        $_SESSION['events_ok'] = true;
        header('Location: gestion-events.php');
        exit;
    }
    echo 'Accès refusé';
}

if (empty($_SESSION['events_ok'])) {
    echo '<form method="post"><input type="hidden" name="action" value="in"><input name="u"><input name="p" type="password"><button>OK</button></form>';
    exit;
}

echo '<form method="post"><input name="title"><button>Enregistrer</button></form><a href="?out=1">Sortir</a>';
