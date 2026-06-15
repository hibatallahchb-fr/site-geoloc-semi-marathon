<?php
define('DB_HOST', 'fdb1030.runhosting.com');   //localhost
define('DB_NOM',  '4580169_wpress856b2b6c');
define('DB_USER', '4580169_wpress856b2b6c');
define('DB_PASS', 'UnimesHib@t26');   //r7bEHDwm4P4wXtXQtxtRWl5TVwJTVfdA

$connexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NOM);

if ($connexion->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['erreur' => true, 'message' => 'Connexion MySQL impossible : ' . $connexion->connect_error]);
    exit;
}
else {
    echo ("connxion ok " .__DIR__);
}

$connexion->set_charset('utf8mb4');

