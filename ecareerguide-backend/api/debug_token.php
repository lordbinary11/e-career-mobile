<?php
// backend/api/debug_token.php - Debug endpoint to show JWT token info

// Include CORS helper
require_once __DIR__ . '/cors_helper.php';

header('Content-Type: application/json');

// Handle preflight requests (OPTIONS) - Must exit here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include JWT helper
require_once __DIR__ . '/jwt_helper.php';

try {
    // Get the Authorization header
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? '';
    
    if (empty($auth_header) || !preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        echo json_encode([
            "success" => false,
            "error" => "No Authorization header found",
            "headers" => $headers
        ]);
        exit();
    }
    
    $token = $matches[1];
    
    // Decode the token without verification (for debugging)
    $token_parts = explode('.', $token);
    if (count($token_parts) !== 3) {
        echo json_encode([
            "success" => false,
            "error" => "Invalid token format"
        ]);
        exit();
    }
    
    $payload = json_decode(base64_decode($token_parts[1]), true);
    
    echo json_encode([
        "success" => true,
        "token" => $token,
        "payload" => $payload,
        "headers" => $headers
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?> 