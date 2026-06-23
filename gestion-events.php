<?php
session_start();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'POST') {
    echo 'POST';
} else {
    echo 'Gestion events';
}
