namespace Tweek.Engine.Core.Rules
{
    public interface IRuleParser
    {
        IRule Parse(string sourceCode);
    }
}
