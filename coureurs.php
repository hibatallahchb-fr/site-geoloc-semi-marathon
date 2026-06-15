<?php
// ============================================================
//  Retourne la liste de tous les coureurs en JSON
//  Appelé par la vue Spectateur toutes les 5 secondes
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

require_once 'connexion.php';

$sql = "SELECT c.id, c.dossard, c.prenom, c.nom, c.club, c.statut,
               c.lat, c.lng, c.distance_km AS dist, c.temps_s AS temps, c.live,
               e.nom AS epreuve_nom, e.distance_km AS epreuve_dist, e.type AS epreuve_type
        FROM coureurs c
        LEFT JOIN epreuves e ON c.epreuve_id = e.id
        ORDER BY c.live DESC, c.dossard ASC";

$res = $connexion->query($sql);
$coureurs = [];

while ($row = $res->fetch_assoc()) {
    $coureurs[] = [
        'id'           => (int)   $row['id'],
        'dossard'      => $row['dossard'] ? (int) $row['dossard'] : null,
        'prenom'       =>         $row['prenom'],
        'nom'          =>         $row['nom'],
        'club'         =>         $row['club'] ?? '',
        'statut'       =>         $row['statut'],
        'lat'          => (float) $row['lat'],
        'lng'          => (float) $row['lng'],
        'dist'         => (float) $row['dist'],
        'temps'        => (int)   $row['temps'],
        'live'         => (bool)  $row['live'],
        'epreuve_nom'  =>         $row['epreuve_nom'] ?? '',
        'epreuve_dist' => (float) $row['epreuve_dist'],
        'epreuve_type' =>         $row['epreuve_type'] ?? ''
    ];
}

echo json_encode($coureurs);
$connexion->close();
