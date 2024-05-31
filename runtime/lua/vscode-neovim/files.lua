local api, fn = vim.api, vim.fn

local vscode = require("vscode-neovim.api")
local util = require("vscode-neovim.util")

-- this module is responsible for implementing :write and :edit commands
local M = {}


function collect(ev)
    local data = {}
    data["afile"] = ev.file
    data["amatch"] = ev.match
    data["abuf"] = ev.buf
    data["event"] = ev.event
    data["bang"] = vim.v.cmdbang
    data["cmdarg"] = vim.v.cmdarg
    data["option_new"] = vim.v.option_new
    data["uri"] = api.nvim_buf_get_var(0, "vscode_uri")
    data["uri_data"] = api.nvim_buf_get_var(0, "vscode_uri_data")
    vim.print(vim.inspect(data))
    return data
end

function M.setup()
    api.nvim_create_autocmd({ "BufWriteCmd" }, {
        pattern = "*",
        callback = function(ev)
            local data = collect(ev)
            vscode.action("save-file", { args = { data["uri"], data["bang"] } })
        end
    })

    api.nvim_create_autocmd({ "BufReadCmd" }, {
        pattern = "*",
        callback = collect
    })
end

return M
