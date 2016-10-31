namespace Tweek.ApiService
{
    public class SettingsModel
    {
        public CouchbaseSettings couchbase { get; set; }
        public string rulesBlobUrl { get; set; }
        public GitSettings git { get; set; }
    }

    public class CouchbaseSettings
    {
        public string url { get; set; }
        public string bucketName { get; set; }
        public string password { get; set; }
    }

    public class GitSettings
    {
        public string url { get; set; }
        public string user { get; set; }
        public string password { get; set; }
    }
}