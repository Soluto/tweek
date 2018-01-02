require "json"

def validate_deps(rev, change, visited = Hash.new)
  if visited.has_key?(change) then
    puts "found circular dep"
    raise '400 Bad Request - found circular dep'  
  end
  visited[change] = true
  json = JSON.load `git show #{rev}:#{change}`
  json["dependencies"]&.each do |dep| 
    dep.strip!
    validate_deps rev, "manifests/#{dep}.json", visited
  end
  return visited
end

rows = STDIN.read.split("\n")
rows.each do |line|
  oldrev,newrev,refname = line.split(" ")
  puts "oldrev #{oldrev}"
  puts "newrev #{newrev}"
  puts "refname #{refname}"
  puts "validating commit #{newrev}"
  payload = Hash.new
  changes = `git diff --name-only #{oldrev} #{newrev}`.lines.map { |x| x.strip }
  while (change = changes.shift())
    data = `git show #{newrev}:#{change}`
    if $?.success?
      if change =~ /^manifests/ then
        puts validate_deps newrev, change
      else
        payload[change] = data
      end
    end
  end
  puts "finished validating a commit"
  puts payload
end




