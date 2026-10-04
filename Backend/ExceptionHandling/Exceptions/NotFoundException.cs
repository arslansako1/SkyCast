using System.Net;

public class NotFoundException(string message, object key)
 : AppException($"{message} with identifier {key} was not found", HttpStatusCode.NotFound);
