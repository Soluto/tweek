using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Sync.Uploaders
{
    public interface IUploader
    {
        Task Upload(string commitId);
    }
}