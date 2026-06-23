<?php
session_start();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'POST') {
    echo 'POST';
} else {
    echo '<form method="post"><input name="title"><button>OK</button></form>';
}
