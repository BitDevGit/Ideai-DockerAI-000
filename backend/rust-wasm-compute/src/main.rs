use actix_web::{web, App, HttpServer, HttpResponse, Result as ActixResult};
use serde::{Deserialize, Serialize};
use prometheus::{Encoder, TextEncoder, Counter, Histogram, HistogramOpts, Gauge, Opts};

// Prometheus metrics
lazy_static::lazy_static! {
    static ref REQUEST_COUNT: Counter = Counter::with_opts(
        Opts::new("rust_compute_requests_total", "Total number of requests")
    ).expect("Failed to create counter");
    static ref REQUEST_LATENCY: Histogram = {
        let opts = HistogramOpts::new("rust_compute_request_duration_seconds", "Request latency in seconds");
        Histogram::with_opts(opts).expect("Failed to create histogram")
    };
    static ref COMPUTE_OPERATIONS: Counter = Counter::with_opts(
        Opts::new("rust_compute_operations_total", "Total compute operations")
    ).expect("Failed to create counter");
    static ref TOKENS_PER_SECOND: Gauge = Gauge::with_opts(
        Opts::new("rust_compute_tokens_per_second", "Tokens per second")
    ).expect("Failed to create gauge");
}

#[derive(Deserialize)]
struct BenchmarkRequest {
    iterations: Option<u32>,
}

#[derive(Serialize)]
struct BenchmarkResponse {
    result: String,
    iterations: u32,
    duration_ms: f64,
    throughput: f64,
}

#[derive(Deserialize)]
struct MathRequest {
    operation: String,
    data: Vec<f64>,
}

#[derive(Serialize)]
struct MathResponse {
    result: Vec<f64>,
    duration_ms: f64,
}

// High-performance matrix multiplication using ndarray
fn compute_matrix_multiply(size: usize) -> f64 {
    use ndarray::Array2;
    
    let a = Array2::<f64>::ones((size, size));
    let b = Array2::<f64>::ones((size, size));
    let c = a.dot(&b);
    
    c.sum()
}

// High-performance embedding computation (simplified)
fn compute_embeddings(data: &[f64]) -> Vec<f64> {
    use rayon::prelude::*;
    
    data.par_iter()
        .map(|x| (x * 2.0).sin().cos())
        .collect()
}

// Benchmark function
async fn benchmark_compute(req: web::Json<BenchmarkRequest>) -> ActixResult<HttpResponse> {
    let iterations = req.iterations.unwrap_or(1000);
    let timer = REQUEST_LATENCY.start_timer();
    REQUEST_COUNT.inc();
    
    let start = std::time::Instant::now();
    
    // Perform high-performance computations
    let results: Vec<f64> = (0..iterations)
        .map(|i| compute_matrix_multiply(100 + (i % 50) as usize))
        .collect();
    
    let duration = start.elapsed();
    let duration_ms = duration.as_secs_f64() * 1000.0;
    let throughput = iterations as f64 / duration.as_secs_f64();
    
    COMPUTE_OPERATIONS.inc_by(iterations as f64);
    TOKENS_PER_SECOND.set(throughput);
    timer.observe_duration();
    
    Ok(HttpResponse::Ok().json(BenchmarkResponse {
        result: format!("Completed {} iterations", iterations),
        iterations,
        duration_ms,
        throughput,
    }))
}

// Math computation endpoint
async fn compute_math(req: web::Json<MathRequest>) -> ActixResult<HttpResponse> {
    let timer = REQUEST_LATENCY.start_timer();
    REQUEST_COUNT.inc();
    
    let start = std::time::Instant::now();
    
    let result = match req.operation.as_str() {
        "embedding" => compute_embeddings(&req.data),
        "multiply" => {
            use rayon::prelude::*;
            req.data.par_iter().map(|x| x * 2.0).collect()
        }
        "add" => {
            use rayon::prelude::*;
            req.data.par_iter().map(|x| x + 1.0).collect()
        }
        _ => return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Unknown operation"
        }))),
    };
    
    let duration = start.elapsed();
    let duration_ms = duration.as_secs_f64() * 1000.0;
    
    timer.observe_duration();
    
    Ok(HttpResponse::Ok().json(MathResponse {
        result,
        duration_ms,
    }))
}

// Health check endpoint
async fn health() -> ActixResult<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "rust-wasm-compute"
    })))
}

// Metrics endpoint for Prometheus
async fn metrics() -> ActixResult<HttpResponse> {
    let encoder = TextEncoder::new();
    let metric_families = prometheus::gather();
    let mut buffer = Vec::new();
    encoder.encode(&metric_families, &mut buffer).unwrap();
    
    Ok(HttpResponse::Ok()
        .content_type("text/plain; version=0.0.4")
        .body(String::from_utf8(buffer).unwrap()))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Register metrics with the default registry
    prometheus::register(Box::new(REQUEST_COUNT.clone())).unwrap();
    prometheus::register(Box::new(REQUEST_LATENCY.clone())).unwrap();
    prometheus::register(Box::new(COMPUTE_OPERATIONS.clone())).unwrap();
    prometheus::register(Box::new(TOKENS_PER_SECOND.clone())).unwrap();
    
    println!("Starting Rust/Wasm Compute Service on port 8080");
    
    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health))
            .route("/metrics", web::get().to(metrics))
            .route("/benchmark", web::post().to(benchmark_compute))
            .route("/compute/math", web::post().to(compute_math))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

