using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Threading.Tasks;

namespace Tweek.Publishing.Service.Sync.Converters
{
    public interface IConverter
    {
        (string fileName, string fileContent, string fileMimeType) Convert(string commitId, ICollection<string> files, Func<string, string> readFn);
    }
}