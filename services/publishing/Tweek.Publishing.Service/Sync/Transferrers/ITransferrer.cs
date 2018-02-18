using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Sync.Transferrers
{
    public interface ITransferrer
    {
        Task Transfer(string commitId);
    }
}