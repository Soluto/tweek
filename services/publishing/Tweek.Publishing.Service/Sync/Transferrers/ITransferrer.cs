namespace Tweek.Publishing.Service.Sync.Transferrers
{
    public interface ITransferrer
    {
        void Transfer(string commitId);
    }
}