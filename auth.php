<?php
// ============================================================
//  Gère les deux modes d'authentification : (API d'authentification)
//  Officielle : dossard + PIN
//  Libre : nom + prénom + date de naissance
// ============================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__. '/connexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['erreur' => true, 'message' => 'Méthode non autorisée']);
    exit;
}

$donnees = json_decode(file_get_contents('php://input'), true);
$mode    = $donnees['mode'] ?? '';

// ============================================================
//  MODE OFFICIEL : dossard + PIN
// ============================================================
if ($mode === 'officiel') {
    $dossard  = (int) ($donnees['dossard'] ?? 0);
    $pin      = $connexion->real_escape_string(trim($donnees['pin'] ?? ''));
   

    if (!$dossard || !$pin) {
        echo json_encode(['erreur' => true, 'message' => 'Dossard et PIN requis']);
        exit;
    }

    $sql = "SELECT c.*, e.nom AS epreuve_nom, e.distance_km, e.type AS epreuve_type
            FROM coureurs c
            LEFT JOIN epreuves e ON c.epreuve_id = e.id
            WHERE c.dossard = $dossard AND c.pin_code = '$pin'
            LIMIT 1";

    $res = $connexion->query($sql);
    

    if ($res->num_rows === 0) {
        echo json_encode(['erreur' => true, 'message' => 'Dossard ou PIN incorrect']);
        exit;
    }

    $coureur = $res->fetch_assoc();
    $connexion->query("UPDATE coureurs SET live = 1, updated_at = NOW() WHERE id = {$coureur['id']}");

    echo json_encode([
        'erreur'  => false,
        'message' => 'Connexion réussie, bonne course ' . $coureur['prenom'] . ' !',
        'coureur' => formaterCoureur($coureur)
    ]);

// ============================================================
//  MODE LIBRE : nom + prénom + date de naissance
// ============================================================

} elseif ($mode === 'libre') {
    $prenom  = $connexion->real_escape_string(trim($donnees['prenom'] ?? ''));
    $nom     = $connexion->real_escape_string(trim($donnees['nom'] ?? ''));
    $ddn     = $connexion->real_escape_string(trim($donnees['date_naissance'] ?? ''));
    $club    = $connexion->real_escape_string(trim($donnees['club'] ?? ''));

    if (!$prenom || !$nom || !$ddn) {
        echo json_encode(['erreur' => true, 'message' => 'Prénom, nom et date de naissance requis']);
        exit;
    }

    // Chercher si la personne est dans la base
    $sql = "SELECT c.*, e.nom AS epreuve_nom, e.distance_km, e.type AS epreuve_type
            FROM coureurs c
            LEFT JOIN epreuves e ON c.epreuve_id = e.id
            WHERE LOWER(c.prenom) = LOWER('$prenom')
              AND LOWER(c.nom)    = LOWER('$nom')
              AND c.date_naissance = '$ddn'
            LIMIT 1";

    $res = $connexion->query($sql);

    if ($res->num_rows > 0) {
        // Trouvé dans la base → statut inscrit
        $coureur = $res->fetch_assoc();
        $connexion->query("UPDATE coureurs SET live = 1, statut = 'inscrit', updated_at = NOW() WHERE id = {$coureur['id']}");
        echo json_encode([  
            
            'erreur'  => false,
            'message' => 'Bienvenue ' . $coureur['prenom'] . ' ! Vous êtes inscrit(e) à la course.',
            'coureur' => formaterCoureur($coureur)
           
        ]);
    } else {
        // Pas trouvé → créer un compte temporaire statut non_inscrit
        $sql2 = "INSERT INTO coureurs (prenom, nom, date_naissance, club, statut, live)
                 VALUES ('$prenom', '$nom', '$ddn', '$club', 'non_inscrit', 1)";
        $connexion->query($sql2);
        $id = $connexion->insert_id;

        $coureur = [
            'id'           => $id,
            'dossard'      => null,
            'prenom'       => $prenom,
            'nom'          => $nom,
            'club'         => $club,
            'statut'       => 'non_inscrit',
            'epreuve_nom'  => null,
            'distance_km'  => null,
            'epreuve_type' => null
        ];

        echo json_encode([
            'erreur'  => false,
            'message' => 'Bienvenue ' . $prenom . ' ! Vous participez en tant que non inscrit(e).',
            'coureur' => $coureur
        ]);
    }
} else {
    echo json_encode(['erreur' => true, 'message' => 'Mode invalide']);
}

$connexion->close();

function formaterCoureur($c) {
    return [
        'id'           => (int) $c['id'],
        'dossard'      => $c['dossard'] ? (int) $c['dossard'] : null,
        'prenom'       => $c['prenom'],
        'nom'          => $c['nom'],
        'club'         => $c['club'] ?? '',
        'statut'       => $c['statut'],
        'epreuve_nom'  => $c['epreuve_nom'] ?? null,
        'distance_km'  => $c['distance_km'] ?? null,
        'epreuve_type' => $c['epreuve_type'] ?? null,
       
    ];
}
