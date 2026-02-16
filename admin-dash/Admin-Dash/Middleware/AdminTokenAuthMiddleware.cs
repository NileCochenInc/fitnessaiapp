namespace Admin_Dash.Middleware;

public class AdminTokenAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly string _apiToken;
    private readonly List<string> _exemptPaths = new()
    {
        "/health"
    };

    public AdminTokenAuthMiddleware(RequestDelegate next)
    {
        _next = next;
        _apiToken = Environment.GetEnvironmentVariable("GrafanaSettings__ApiToken") ?? throw new InvalidOperationException("GrafanaSettings__ApiToken is not configured");
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip authentication for exempt endpoints
        if (_exemptPaths.Any(path => context.Request.Path.StartsWithSegments(path)))
        {
            await _next(context);
            return;
        }

        // All other endpoints require authentication
        if (!context.Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
            return;
        }

        var token = authHeader.ToString().StartsWith("Bearer ") ? authHeader.ToString()[7..] : authHeader.ToString();
        
        if (token != _apiToken)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
            return;
        }

        await _next(context);
    }
}

public static class AdminTokenAuthMiddlewareExtensions
{
    public static IApplicationBuilder UseAdminTokenAuth(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AdminTokenAuthMiddleware>();
    }
}

