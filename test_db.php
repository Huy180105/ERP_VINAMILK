<?php
try {
    $pdo = new PDO('mysql:host=db;port=3306;dbname=quanly_erp', 'root', 'root', [PDO::ATTR_TIMEOUT => 5]);
    $res = $pdo->query('SELECT COUNT(*) FROM lenhsanxuat');
    echo 'DB OK: ' . $res->fetchColumn() . " rows\n";
} catch(Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n";
}
