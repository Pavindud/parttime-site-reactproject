<?php

require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../config/db.php';

allowCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$search = trim($_GET['search'] ?? '');

try {
    $pdo = getDb();

    if ($search !== '') {
        $searchTerm = '%' . $search . '%';
        $stmt = $pdo->prepare('
            SELECT j.id, j.title, j.pay, j.location, j.poster_id, u.name AS poster_name, j.created_at
            FROM jobs j
            JOIN users u ON j.poster_id = u.id
            WHERE j.status = "open" AND (j.title LIKE ? OR j.location LIKE ? OR j.description LIKE ?)
            ORDER BY j.created_at DESC
        ');
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
    } else {
        $stmt = $pdo->prepare('
            SELECT j.id, j.title, j.pay, j.location, j.poster_id, u.name AS poster_name, j.created_at
            FROM jobs j
            JOIN users u ON j.poster_id = u.id
            WHERE j.status = "open"
            ORDER BY j.created_at DESC
        ');
        $stmt->execute();
    }

    $jobs = $stmt->fetchAll();
    $data = [];
    foreach ($jobs as $job) {
        $data[] = [
            'id' => (int)$job['id'],
            'title' => $job['title'],
            'pay' => $job['pay'],
            'location' => $job['location'],
            'poster_id' => (int)$job['poster_id'],
            'poster_name' => $job['poster_name'],
            'created_at' => $job['created_at']
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
