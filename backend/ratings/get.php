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

$userId = filter_var($_GET['user_id'] ?? null, FILTER_VALIDATE_INT);
if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing user ID']);
    exit;
}

try {
    $pdo = getDb();

    $stmtUser = $pdo->prepare('SELECT id, name, role FROM users WHERE id = ?');
    $stmtUser->execute([$userId]);
    $user = $stmtUser->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    $stmtAvg = $pdo->prepare('SELECT AVG(stars) AS avg_rating, COUNT(*) AS total_count FROM ratings WHERE rated_id = ?');
    $stmtAvg->execute([$userId]);
    $stats = $stmtAvg->fetch();

    $count = (int)$stats['total_count'];
    $average = $count > 0 ? round((float)$stats['avg_rating'], 1) : null;

    $stmtReviews = $pdo->prepare('
        SELECT 
            r.stars,
            r.comment,
            u.name AS rater_name,
            j.title AS job_title,
            r.created_at
        FROM ratings r
        JOIN users u ON r.rater_id = u.id
        JOIN jobs j ON r.job_id = j.id
        WHERE r.rated_id = ?
        ORDER BY r.created_at DESC
    ');
    $stmtReviews->execute([$userId]);

    $reviewsRows = $stmtReviews->fetchAll();
    $reviews = [];
    foreach ($reviewsRows as $row) {
        $reviews[] = [
            'stars' => (int)$row['stars'],
            'comment' => $row['comment'],
            'rater_name' => $row['rater_name'],
            'job_title' => $row['job_title'],
            'created_at' => $row['created_at']
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'role' => $user['role']
            ],
            'average' => $average,
            'count' => $count,
            'reviews' => $reviews
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
