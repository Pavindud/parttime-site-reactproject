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

$jobId = filter_var($_GET['job_id'] ?? null, FILTER_VALIDATE_INT);
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

    $stmtApps = $pdo->prepare('
        SELECT 
            a.id AS application_id,
            a.employee_id,
            u.name AS employee_name,
            (SELECT AVG(stars) FROM ratings WHERE rated_id = a.employee_id) AS avg_rating,
            a.status,
            a.applied_at,
            (
                SELECT COUNT(*) 
                FROM ratings r 
                WHERE r.job_id = a.job_id AND r.rater_id = ? AND r.rated_id = a.employee_id
            ) AS rating_count
        FROM applications a
        JOIN users u ON a.employee_id = u.id
        WHERE a.job_id = ?
        ORDER BY a.applied_at DESC
    ');
    $stmtApps->execute([$posterId, $jobId]);

    $applicants = $stmtApps->fetchAll();
    $data = [];
    foreach ($applicants as $app) {
        $avgRating = $app['avg_rating'];
        $data[] = [
            'application_id' => (int)$app['application_id'],
            'employee_id' => (int)$app['employee_id'],
            'employee_name' => $app['employee_name'],
            'employee_rating' => $avgRating !== null ? round((float)$avgRating, 1) : null,
            'status' => $app['status'],
            'applied_at' => $app['applied_at'],
            'has_rated' => ((int)$app['rating_count'] > 0)
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
