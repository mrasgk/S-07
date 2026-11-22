namespace Rukn.Api.Exceptions;

public class DomainValidationException : Exception
{
    public DomainValidationException(string message) : base(message)
    {
    }
}

public class OutOfStockException : DomainValidationException
{
    public OutOfStockException(string message) : base(message)
    {
    }
}

public class ResourceNotFoundException : DomainValidationException
{
    public ResourceNotFoundException(string message) : base(message)
    {
    }
}
