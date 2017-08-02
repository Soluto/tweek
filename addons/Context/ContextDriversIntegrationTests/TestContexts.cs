using System.Collections;
using System.Collections.Generic;

namespace ContextDriversIntegrationTests
{
    public class TestContexts: IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            yield return new object[] {new TestableRedisContext()};
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}