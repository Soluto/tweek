using System;

namespace Tweek.Publishing.Service.Sync
{
    public class StaleRevisionException : System.Exception
    {
        public StaleRevisionException(string currentCommit, string incomingCommit)
        {
            Data["CurrentCommit"] = currentCommit;
            Data["IncomingCommit"] = incomingCommit;
        }
    }
}