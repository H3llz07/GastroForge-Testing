-- Pandoc Lua filter for the GastroForge QA LaTeX pipeline.
-- Handles <br> in cells, checkbox markers, code wrapping, table widths and
-- APA-style table captions (Tabla N / italic title / Nota.).

local stringify = pandoc.utils.stringify
local apa = PANDOC_WRITER_OPTIONS and false
local mode = "technical"

function Meta(meta)
  if meta.pdfmode then
    mode = stringify(meta.pdfmode)
  end
  return nil
end

local function latex(s)
  return pandoc.RawInline("latex", s)
end

-- Escape a string for use inside \texttt and allow line breaks at separators.
local specials = {
  ["\\"] = "\\textbackslash{}", ["{"] = "\\{", ["}"] = "\\}", ["$"] = "\\$",
  ["&"] = "\\&", ["#"] = "\\#", ["^"] = "\\textasciicircum{}", ["_"] = "\\_",
  ["%"] = "\\%", ["~"] = "\\textasciitilde{}", ["<"] = "\\textless{}",
  [">"] = "\\textgreater{}", ['"'] = "\\textquotedbl{}", ["'"] = "\\textquotesingle{}",
  ["`"] = "\\textasciigrave{}", ["-"] = "-{}",
}
local breakers = { ["/"] = true, ["."] = true, ["_"] = true, ["-"] = true, [":"] = true,
  [","] = true, ["="] = true, ["|"] = true, ["("] = true, [")"] = true, ["["] = true,
  ["]"] = true, [";"] = true, ["?"] = true, ["&"] = true }
local asciiFallback = { ["→"] = "->", ["≥"] = ">=", ["≤"] = "<=", ["×"] = "x" }

local function escapeCode(text)
  local out = {}
  local run = 0
  for _, cp in utf8.codes(text) do
    local ch = utf8.char(cp)
    ch = asciiFallback[ch] or ch
    for _, c in utf8.codes(ch) do
      local piece = utf8.char(c)
      out[#out + 1] = specials[piece] or piece
      if breakers[piece] then
        out[#out + 1] = "\\allowbreak{}"
        run = 0
      else
        run = run + 1
        if run >= 18 then
          out[#out + 1] = "\\allowbreak{}"
          run = 0
        end
      end
    end
  end
  return table.concat(out)
end

function Code(el)
  return latex("\\texttt{" .. escapeCode(el.text) .. "}")
end

function CodeBlock(el)
  local body = el.text:gsub("\r", "")
  return pandoc.RawBlock("latex",
    "\\begin{Verbatim}[breaklines,breakanywhere,fontsize=\\footnotesize]\n" .. body ..
    "\n\\end{Verbatim}")
end

function RawInline(el)
  if el.format:match("html") then
    if el.text:match("^<br") then
      return pandoc.LineBreak()
    end
    return {}
  end
  return nil
end

function RawBlock(el)
  if el.format:match("html") then
    return {}
  end
  return nil
end

-- Checkbox markers: "[x]" and "[ ]" become box symbols.
function Inlines(inlines)
  local out = {}
  local i = 1
  local changed = false
  while i <= #inlines do
    local el = inlines[i]
    if el.t == "Str" and el.text == "[x]" then
      out[#out + 1] = latex("\\ensuremath{\\boxtimes}")
      changed = true
    elseif el.t == "Str" and el.text == "[" and inlines[i + 1] and inlines[i + 1].t == "Space"
      and inlines[i + 2] and inlines[i + 2].t == "Str" and inlines[i + 2].text:sub(1, 1) == "]" then
      out[#out + 1] = latex("\\ensuremath{\\square}")
      local rest = inlines[i + 2].text:sub(2)
      if rest ~= "" then
        out[#out + 1] = pandoc.Str(rest)
      end
      i = i + 2
      changed = true
    elseif el.t == "Str" and el.text:find("[\u{FEFF}\u{2705}\u{274C}\u{26A0}\u{2714}\u{2716}]") then
      local text = el.text:gsub("\u{FEFF}", "")
      text = text:gsub("\u{2705}", "[OK]"):gsub("\u{274C}", "[X]"):gsub("\u{26A0}", "(!)")
      text = text:gsub("\u{2714}", "OK"):gsub("\u{2716}", "X")
      out[#out + 1] = pandoc.Str(text)
      changed = true
    else
      out[#out + 1] = el
    end
    i = i + 1
  end
  if changed then
    return pandoc.Inlines(out)
  end
  return nil
end

local function cellText(cell)
  return stringify(cell.contents)
end

local function allRows(tbl)
  local rows = {}
  for _, r in ipairs(tbl.head.rows) do rows[#rows + 1] = r end
  for _, body in ipairs(tbl.bodies) do
    for _, r in ipairs(body.body) do rows[#rows + 1] = r end
  end
  return rows
end

function Table(tbl)
  local n = #tbl.colspecs
  local maxlen, total, count, tok = {}, {}, 0, {}
  for j = 1, n do maxlen[j] = 0; total[j] = 0; tok[j] = 0 end
  for _, row in ipairs(allRows(tbl)) do
    count = count + 1
    for j, cell in ipairs(row.cells) do
      local len = utf8.len(cellText(cell)) or 0
      if len > maxlen[j] then maxlen[j] = len end
      total[j] = total[j] + len
      for word in cellText(cell):gmatch("%S+") do
        local wl = utf8.len(word) or 0
        if wl > tok[j] then tok[j] = wl end
      end
    end
  end
  local weights, sum = {}, 0
  for j = 1, n do
    local avg = count > 0 and total[j] / count or 1
    local w = 0.5 * math.min(maxlen[j], 70) + 0.5 * math.min(avg, 70)
    if w < 7 then w = 7 end
    local tw = math.min(tok[j], 22) * 1.1
    if w < tw then w = tw end
    weights[j] = w
    sum = sum + w
  end
  for j = 1, n do
    local align = tbl.colspecs[j][1]
    if align == pandoc.AlignDefault then align = pandoc.AlignLeft end
    tbl.colspecs[j] = { align, weights[j] / sum }
  end
  local size, spacing = "\\footnotesize", "\\singlespacing"
  if n >= 6 then size = "\\scriptsize" end
  return {
    pandoc.RawBlock("latex", "\\begingroup" .. spacing .. size .. "\\setlength{\\parskip}{0pt}"),
    tbl,
    pandoc.RawBlock("latex", "\\endgroup\\medskip"),
  }
end

function Header(el)
  if mode == "technical" and el.level >= 2 then
    return {
      pandoc.RawBlock("latex", "\\Needspace{10\\baselineskip}"),
      el,
    }
  end
  return nil
end

-- APA captions: "**Tabla N**" / "*Title*" / "*Nota.* text"
function Para(el)
  if mode ~= "apa" then return nil end
  local c = el.content
  if c[1] and c[1].t == "Strong" and stringify(c[1]):match("^Tabla %d+$") then
    local out = {
      latex("\\Needspace{12\\baselineskip}\\noindent\\textbf{" .. stringify(c[1]) .. "}\\par\\nopagebreak\\noindent\\textit{"),
    }
    for k = 2, #c do
      local x = c[k]
      if x.t == "Emph" then
        for _, y in ipairs(x.content) do out[#out + 1] = y end
      elseif x.t ~= "SoftBreak" and x.t ~= "LineBreak" then
        out[#out + 1] = x
      end
    end
    out[#out + 1] = latex("}\\par\\nopagebreak\\vspace{0.3em}")
    return pandoc.Para(pandoc.Inlines(out))
  end
  if #c == 1 and c[1].t == "Strong" then
    local out = { latex("\\begin{center}\\textbf{") }
    for _, y in ipairs(c[1].content) do out[#out + 1] = y end
    out[#out + 1] = latex("}\\end{center}")
    return pandoc.Para(pandoc.Inlines(out))
  end
  if #c == 1 and c[1].t == "Emph" then
    local out = { latex("\\noindent\\nopagebreak\\textit{") }
    for _, y in ipairs(c[1].content) do out[#out + 1] = y end
    out[#out + 1] = latex("}\\par\\nopagebreak\\vspace{0.3em}")
    return pandoc.Para(pandoc.Inlines(out))
  end
  if c[1] and c[1].t == "Emph" and stringify(c[1]) == "Nota." then
    local out = { latex("\\begingroup\\singlespacing\\small\\noindent") }
    for _, x in ipairs(c) do out[#out + 1] = x end
    out[#out + 1] = latex("\\par\\endgroup\\medskip")
    return pandoc.Para(pandoc.Inlines(out))
  end
  return nil
end

-- Applies the cover-title paragraph rule only to APA mode: first block bold title is dropped
-- by preprocessing, so nothing else is required here.
return {
  { Meta = Meta },
  {
    Inlines = Inlines,
    Code = Code,
    CodeBlock = CodeBlock,
    RawInline = RawInline,
    RawBlock = RawBlock,
    Table = Table,
    Header = Header,
    Para = Para,
  },
  {
    Pandoc = function(doc)
      if mode ~= "apa" then return nil end
      local inRefs = false
      for i, b in ipairs(doc.blocks) do
        if b.t == "Header" then
          inRefs = stringify(b) == "Referencias"
        elseif inRefs and b.t == "Para" then
          table.insert(b.content, 1, latex("\\noindent\\hangindent=0.5in\\hangafter=1 "))
        end
      end
      return doc
    end,
  },
}
