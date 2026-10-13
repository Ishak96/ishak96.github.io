require "bibtex"
require "digest"
require "json"

module Jekyll
  class PublicationDataGenerator < Generator
    safe true
    priority :low

    def generate(site)
      scholar = site.config.fetch("scholar")
      source = File.join(site.source, scholar.fetch("source").sub(%r{\A/}, ""), scholar.fetch("bibliography"))
      bibliography = BibTeX.open(source)
      bibliography.replace_strings if scholar["replace_strings"]
      bibliography.join if scholar["join_strings"] && scholar["replace_strings"]
      publications = bibliography.select { |entry| entry.is_a?(BibTeX::Entry) }.map do |entry|
        {
          "key" => entry.key.to_s,
          "title" => entry[:title].to_s,
          "abstract" => entry[:abstract].to_s,
          "year" => entry[:year].to_s,
          "venue" => (entry[:booktitle] || entry[:journal]).to_s,
          "doi" => entry[:doi].to_s,
          "research_topic" => entry[:research_topic].to_s,
          "oral" => entry[:oral].to_s,
          "note" => entry[:note].to_s
        }
      end
      if publications.empty? || !bibliography.errors.empty?
        raise Jekyll::Errors::FatalException, "Publication data: empty or malformed bibliography #{source}"
      end
      content = JSON.generate(publications)
      page = PageWithoutAFile.new(site, site.source, "assets/data", "research-publications.json")
      page.content = content
      page.data["layout"] = nil
      page.data["render_with_liquid"] = false
      site.pages << page
      site.data["research_publications_hash"] = Digest::SHA256.hexdigest(content)[0, 16]
    end
  end
end
