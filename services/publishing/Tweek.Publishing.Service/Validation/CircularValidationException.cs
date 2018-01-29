using System;

namespace Tweek.Publishing.Service.Validation
{
  public class CircularValidationException : Exception
  {
      public CircularValidationException(string path):base("circular dependencies detected")
      {
          this.Data["Path"] = path;
      }
      
  }
}