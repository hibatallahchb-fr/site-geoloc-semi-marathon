<?php
// ============================================================
//  Reçoit et sauvegarde la position GPS du coureur
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

$donnees = json_decode(file_get_contents('php://input'), true);

$coureur_id  = (int)   ($donnees['coureur_id']  ?? 0);
$lat         = (float) ($donnees['lat']          ?? 0);
$lng         = (float) ($donnees['lng']          ?? 0);
$distance    = (float) ($donnees['distance_km']  ?? 0);
$temps       = (int)   ($donnees['temps_s']      ?? 0);

if (!$coureur_id || !$lat || !$lng) {
    echo json_encode(['erreur' => true, 'message' => 'Données GPS incomplètes']);
    exit;
}

// Mettre à jour la position actuelle
$connexion->query("UPDATE coureurs SET
    lat = $lat, lng = $lng,
    distance_km = $distance, temps_s = $temps,
    updated_at = NOW()
    WHERE id = $coureur_id");

// Sauvegarder dans l'historique
$connexion->query("INSERT INTO positions (coureur_id, lat, lng)
    VALUES ($coureur_id, $lat, $lng)");
  

echo json_encode(['erreur' => false, 'message' => 'Position enregistrée']);
$connexion->close();
