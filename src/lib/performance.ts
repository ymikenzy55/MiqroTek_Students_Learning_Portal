/**
 * Performance monitoring utilities
 * Helps track slow operations and database queries
 */

export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV === "development") {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️  Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    } else if (duration > 500) {
      console.log(`⏱️  ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }
  
  return fn();
}

export function measure<T>(label: string, fn: () => T): T {
  if (process.env.NODE_ENV === "development") {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.warn(`⚠️  Slow sync operation: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }
  
  return fn();
}

/**
 * Log database query performance
 */
export function logQuery(operation: string, duration: number, recordCount?: number) {
  if (process.env.NODE_ENV === "development") {
    const emoji = duration > 1000 ? "🐌" : duration > 500 ? "⏱️" : "⚡";
    const records = recordCount !== undefined ? ` (${recordCount} records)` : "";
    console.log(`${emoji} DB: ${operation} - ${duration.toFixed(2)}ms${records}`);
  }
}
