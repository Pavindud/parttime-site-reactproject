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

requireRole('poster');

$posterId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('
        SELECT 
            j.id,
            j.title,
            j.status,
            j.created_at,
            (SELECT COUNT(*) FROM job_views WHERE job_id = j.id) AS view_count,
            (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS applicant_count
        FROM jobs j
        WHERE j.poster_id = ?
        ORDER BY j.created_at DESC
    ');
    $stmt->execute([$posterId]);

    $jobs = $stmt->fetchAll();
    $data = [];
    foreach ($jobs as $job) {
        $data[] = [
            'id' => (int)$job['id'],
            'title' => $job['title'],
            'status' => $job['status'],
            'created_at' => $job['created_at'],
            'view_count' => (int)$job['view_count'],
            'applicant_count' => (int)$job['applicant_count']
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
