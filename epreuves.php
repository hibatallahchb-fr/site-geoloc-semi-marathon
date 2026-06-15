<?php
// ============================================================
//  Retourne les épreuves de l'édition active
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'connexion.php';

$sql = "SELECT e.id, e.nom, e.distance_km, e.heure_depart, e.type
        FROM epreuves e
        INNER JOIN editions ed ON e.edition_id = ed.id
        WHERE ed.active = 1
        ORDER BY e.heure_depart ASC";

$res = $connexion->query($sql);
$epreuves = [];

while ($row = $res->fetch_assoc()) {
    $epreuves[] = [
        'id'          => (int)   $row['id'],
        'nom'         =>         $row['nom'],
        'distance_km' => (float) $row['distance_km'],
        'heure'       =>         $row['heure_depart'],
        'type'        =>         $row['type']
    ];
}

echo json_encode($epreuves);
$connexion->close();
