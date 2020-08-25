using System;

namespace Tweek.Publishing.Service.Validation
{
    public class ManifestStructureException : Exception
    {
        public ManifestStructureException(string path, Exception innerException = null) 
            : base("Manifest structure is invalid", innerException)
        {
            Data["Path"] = path;
        }

        public ManifestStructureException(string path, string message) : base(message)
        {
            Data["Path"] = path;
        }
    }
}