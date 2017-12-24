namespace Tweek.Drivers.Rules.Minio
{
    public class MinioSettings
    {
        public string Endpoint { get; set; }

        public string Bucket { get; set; }

        public string AccessKey { get; set; }

        public string SecretKey { get; set; }

        public bool IsSecure { get; set; }
    }
}
