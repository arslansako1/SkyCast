using System.Net;

public class BadRequestException(string message)
 : AppException(message, HttpStatusCode.BadRequest);
