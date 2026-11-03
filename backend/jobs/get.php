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

$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing job ID']);
    exit;
}

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('
        SELECT j.id, j.title, j.description, j.pay, j.location, j.status, j.created_at, j.poster_id, u.name AS poster_name
        FROM jobs j
        JOIN users u ON j.poster_id = u.id
        WHERE j.id = ?
    ');
    $stmt->execute([$id]);
    $job = $stmt->fetch();

    if (!$job) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Job not found']);
        exit;
    }

    startSession();
    $has_applied = false;

    if (isset($_SESSION['user_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'employee') {
        $employeeId = (int)$_SESSION['user_id'];

        $stmtView = $pdo->prepare('INSERT IGNORE INTO job_views (job_id, employee_id) VALUES (?, ?)');
        $stmtView->execute([$id, $employeeId]);

        $stmtApp = $pdo->prepare('SELECT id FROM applications WHERE job_id = ? AND employee_id = ?');
        $stmtApp->execute([$id, $employeeId]);
        if ($stmtApp->fetch()) {
            $has_applied = true;
        }
    }

    $stmtViews = $pdo->prepare('SELECT COUNT(*) FROM job_views WHERE job_id = ?');
    $stmtViews->execute([$id]);
    $view_count = (int)$stmtViews->fetchColumn();

    $stmtApplicants = $pdo->prepare('SELECT COUNT(*) FROM applications WHERE job_id = ?');
    $stmtApplicants->execute([$id]);
    $applicant_count = (int)$stmtApplicants->fetchColumn();

    $stmtRating = $pdo->prepare('SELECT AVG(stars) FROM ratings WHERE rated_id = ?');
    $stmtRating->execute([(int)$job['poster_id']]);
    $avgRating = $stmtRating->fetchColumn();
    $poster_rating = $avgRating !== null ? round((float)$avgRating, 1) : null;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => (int)$job['id'],
            'title' => $job['title'],
            'description' => $job['description'],
            'pay' => $job['pay'],
            'location' => $job['location'],
            'status' => $job['status'],
            'created_at' => $job['created_at'],
            'poster_id' => (int)$job['poster_id'],
            'poster_name' => $job['poster_name'],
            'poster_rating' => $poster_rating,
            'view_count' => $view_count,
            'applicant_count' => $applicant_count,
            'has_applied' => $has_applied
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
