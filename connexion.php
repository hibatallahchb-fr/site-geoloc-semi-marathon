<?php
define('DB_HOST', 'localhost');
define('DB_NOM',  'semi_marathon');
define('DB_USER', 'root');
define('DB_PASS', 'root');   

$connexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NOM);

if ($connexion->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['erreur' => true, 'message' => 'Connexion MySQL impossible : ' . $connexion->connect_error]);
    exit;
}

$connexion->set_charset('utf8mb4');


