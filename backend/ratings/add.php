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

requireLogin();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$jobId = filter_var($input['job_id'] ?? null, FILTER_VALIDATE_INT);
$ratedId = filter_var($input['rated_id'] ?? null, FILTER_VALIDATE_INT);
$stars = filter_var($input['stars'] ?? null, FILTER_VALIDATE_INT);
$comment = trim($input['comment'] ?? '');

if (!$jobId || !$ratedId || $stars === false || $stars < 1 || $stars > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid job ID, rated ID, and stars (1 to 5) are required']);
    exit;
}

$raterId = (int)$_SESSION['user_id'];
$raterRole = $_SESSION['role'] ?? '';

if ($raterId === $ratedId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Cannot rate yourself']);
    exit;
}

try {
    $pdo = getDb();

    $stmtDup = $pdo->prepare('SELECT id FROM ratings WHERE job_id = ? AND rater_id = ? AND rated_id = ?');
    $stmtDup->execute([$jobId, $raterId, $ratedId]);
    if ($stmtDup->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'You have already rated this user for this job']);
        exit;
    }

    if ($raterRole === 'poster') {
        $stmtLink = $pdo->prepare('
            SELECT a.id 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.job_id = ? AND j.poster_id = ? AND a.employee_id = ?
        ');
        $stmtLink->execute([$jobId, $raterId, $ratedId]);
    } else if ($raterRole === 'employee') {
        $stmtLink = $pdo->prepare('
            SELECT a.id 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.job_id = ? AND a.employee_id = ? AND j.poster_id = ?
        ');
        $stmtLink->execute([$jobId, $raterId, $ratedId]);
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Invalid role for rating']);
        exit;
    }

    if (!$stmtLink->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'No verified application exists between you and this user for this job']);
        exit;
    }

    $insertStmt = $pdo->prepare('
        INSERT INTO ratings (job_id, rater_id, rated_id, stars, comment)
        VALUES (?, ?, ?, ?, ?)
    ');
    $insertStmt->execute([$jobId, $raterId, $ratedId, $stars, $comment]);

    $id = (int)$pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $id
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
