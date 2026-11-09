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

    $stmtApp = $pdo->prepare('SELECT COUNT(*) FROM applications WHERE job_id = ?');
    $stmtApp->execute([$jobId]);
    $hasApplications = (int)$stmtApp->fetchColumn() > 0;

    $stmtRating = $pdo->prepare('SELECT COUNT(*) FROM ratings WHERE job_id = ?');
    $stmtRating->execute([$jobId]);
    $hasRatings = (int)$stmtRating->fetchColumn() > 0;

    if ($hasApplications || $hasRatings) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'This job has applicants or ratings and cannot be deleted. Close it instead.'
        ]);
        exit;
    }

    $pdo->beginTransaction();

    $stmtViews = $pdo->prepare('DELETE FROM job_views WHERE job_id = ?');
    $stmtViews->execute([$jobId]);

    $stmtDeleteJob = $pdo->prepare('DELETE FROM jobs WHERE id = ?');
    $stmtDeleteJob->execute([$jobId]);

    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => null
    ]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
