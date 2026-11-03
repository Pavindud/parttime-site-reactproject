<?php

require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../config/db.php';

allowCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

requireRole('poster');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$jobId = filter_var($input['job_id'] ?? null, FILTER_VALIDATE_INT);

if (!$jobId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing job ID']);
    exit;
}

$posterId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('SELECT id, poster_id FROM jobs WHERE id = ?');
    $stmt->execute([$jobId]);
    $job = $stmt->fetch();

    if (!$job) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Job not found']);
        exit;
    }

    if ((int)$job['poster_id'] !== $posterId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit;
    }

    $updateStmt = $pdo->prepare('UPDATE jobs SET status = "closed" WHERE id = ?');
    $updateStmt->execute([$jobId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => null
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
