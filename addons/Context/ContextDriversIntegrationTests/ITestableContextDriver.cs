using System.Threading.Tasks;
using Engine.Drivers.Context;

namespace ContextDriversIntegrationTests
{
    public interface ITestableContextDriver: IContextDriver
    {
        Task ClearAllData();
    }
}