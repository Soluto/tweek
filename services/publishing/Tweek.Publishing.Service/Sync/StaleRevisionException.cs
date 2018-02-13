using System;

namespace Tweek.Publishing.Service.Sync
{
    public class OutOfSyncRevisionException : System.Exception
    {
        public OldRevisionException(string currentCommit, string incomingCommit)
        {
            Data["CurrentCommit"] = currentCommit;
            Data["IncomingCommit"] = incomingCommit;
        }
    }
}