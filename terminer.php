<?php
// ============================================================
//  Marque le coureur comme termine (live = 0)
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'connexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['erreur' => true, 'message' => 'Méthode non autorisée']);
    exit;
}

$donnees    = json_decode(file_get_contents('php://input'), true);
$coureur_id = (int) ($donnees['coureur_id'] ?? 0);

if (!$coureur_id) {
    echo json_encode(['erreur' => true, 'message' => 'ID coureur manquant']);
    exit;
}

$connexion->query("UPDATE coureurs SET live = 0, updated_at = NOW() WHERE id = $coureur_id");
echo json_encode(['erreur' => false, 'message' => 'Course terminée, bravo !']);
$connexion->close();


 