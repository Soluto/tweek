using System;
using Tweek.Publishing.Service.Validation;
using Xunit;
using FakeItEasy;
using static LanguageExt.Prelude;
using static FakeItEasy.Repeated;
using System.Threading.Tasks;

namespace Tweek.Publishing.Tests
{
    public class GitValidationFlowTests
    {
        [Fact]
        public async Task PatternsAreInvokedCorrectly()
        {
            GitValidationFlow flow = new GitValidationFlow();
            var fakeValidator = A.Fake<IValidator>();
            flow.Validators.Add(("manifests/.*",fakeValidator));

            await flow.Validate("a", "b", async (s)=> {
                switch (s){
                    case var o when o.Contains("diff"):
                        return String.Join("\n",
                        "M\tmanifests/path/to/key.json",
                        "M\tmanifes/path/to/key.json",
                        "M\timplementations/jpad/path/to/key.json");
                    default:
                        return "data";
                }
            });

            A.CallTo(()=> fakeValidator.Validate(null,null)).WithAnyArguments().MustHaveHappened(Exactly.Once);
            A.CallTo(()=> fakeValidator.Validate("manifests/path/to/key.json", 
            A<Func<string,Task<string>>>.Ignored)).MustHaveHappened();
        
        }
    }
}
