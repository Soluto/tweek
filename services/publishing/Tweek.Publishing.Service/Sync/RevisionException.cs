using System;

namespace Tweek.Publishing.Service.Sync
{
    public class RevisionException : System.Exception
    {
        public RevisionException(string currentCommit, string incomingCommit, string reason)
        {
            Data["CurrentCommit"] = currentCommit;
            Data["IncomingCommit"] = incomingCommit;
            Data["Reason"] = reason;
        }
    }
}