# Change Log

## Future Release

-   change default binding for moving editor to above group (from <C-w><C-i> to <C-w><C-k>) (#1119)

## [0.2.0](https://github.com/theol0403/vscode-neovim/compare/v0.1.0...v0.2.0) (2023-06-27)


### Features

* `--clean` option ([#952](https://github.com/theol0403/vscode-neovim/issues/952)) ([d6f05b6](https://github.com/theol0403/vscode-neovim/commit/d6f05b61fb216cfbfc6bf7b927017ce3d8a94e89))
* **actions:** bind gh to mousehover ([48afc0a](https://github.com/theol0403/vscode-neovim/commit/48afc0adb85f91d7ab7c31d951f5b93d79f6e481))
* add $NVIM_APPNAME option ([#1186](https://github.com/theol0403/vscode-neovim/issues/1186)) ([5b54212](https://github.com/theol0403/vscode-neovim/commit/5b5421201701be67fc92d42b39fb049708b4d0f1))
* add bindings and tips to readme ([7625559](https://github.com/theol0403/vscode-neovim/commit/7625559b0dc428b024ce6d21964fb7ba8750ac39))
* add shortcut for navigate code action menu ([#1029](https://github.com/theol0403/vscode-neovim/issues/1029)) ([0f08ef3](https://github.com/theol0403/vscode-neovim/commit/0f08ef3ca4e481c6592326494325b699d98cc7ec))
* allow vscode sync viewport with neovim ([#919](https://github.com/theol0403/vscode-neovim/issues/919)) ([ee56049](https://github.com/theol0403/vscode-neovim/commit/ee560494ce33e58cb31228695faf8303177fa65f))
* allow vscode sync viewport with neovim ([#919](https://github.com/theol0403/vscode-neovim/issues/919)) ([3036a5a](https://github.com/theol0403/vscode-neovim/commit/3036a5a8674afb26372e9f5872365bcc336ab313))
* **buffer_manager:** don't exit insert mode when switching tabs ([#1050](https://github.com/theol0403/vscode-neovim/issues/1050)) ([6c21721](https://github.com/theol0403/vscode-neovim/commit/6c21721fcf72bfa9954366199167c50ead938751))
* **build:** add task for prettier ([2ceec05](https://github.com/theol0403/vscode-neovim/commit/2ceec054607d372de59e3bd671c184dc8abf038f))
* **ci:** add automatic releases ([9ecebdf](https://github.com/theol0403/vscode-neovim/commit/9ecebdf3a28f8ab22cc1cbf688feb7820d1d7669))
* **ci:** add windows ci ([98eaf63](https://github.com/theol0403/vscode-neovim/commit/98eaf63af2e900cf329cc1477227c0294adade15))
* **ci:** always complete build on all platforms ([b7ecb6d](https://github.com/theol0403/vscode-neovim/commit/b7ecb6d4e53e6d89346cf6ff8eeaeadc855be51b))
* **docs:** fix typos ([2826e61](https://github.com/theol0403/vscode-neovim/commit/2826e612cb414e4d765227bf2bbfde811a507aa0))
* **docs:** move getting started to readme ([7dd912b](https://github.com/theol0403/vscode-neovim/commit/7dd912bdb3b80318000434f55d6617a64a6cf500))
* **document_change_manager:** replay insert-mode edits in realtime using `nvim_buf_set_text` ([#992](https://github.com/theol0403/vscode-neovim/issues/992)) ([c6d227b](https://github.com/theol0403/vscode-neovim/commit/c6d227bb7790c7897469d71a4644c33b4b149439))
* **highlight_provider:** fix highlights not updating by `:hi` ([#1010](https://github.com/theol0403/vscode-neovim/issues/1010)) ([f654cc4](https://github.com/theol0403/vscode-neovim/commit/f654cc4efeac6df6d42f7b0e64bf0ac74a3261e3))
* **highlights:** improve compatibility with lightspeed/leap ([#982](https://github.com/theol0403/vscode-neovim/issues/982)) ([a92fa3f](https://github.com/theol0403/vscode-neovim/commit/a92fa3ff2f218d7668aef4a528eeef257d586719))
* list.toggleKeyboardNavigation =&gt; list.find ([#1015](https://github.com/theol0403/vscode-neovim/issues/1015)) ([7978c41](https://github.com/theol0403/vscode-neovim/commit/7978c41366f1107ae730532ec0bdb4a1d9fd3cbc))
* **messages:** don't view Output on &lt;=2 lines [#902](https://github.com/theol0403/vscode-neovim/issues/902) ([1442396](https://github.com/theol0403/vscode-neovim/commit/1442396107c7314af024e6fdd8832cc06dc0792e))
* **messages:** show more messages in Output [#881](https://github.com/theol0403/vscode-neovim/issues/881) ([f6cae67](https://github.com/theol0403/vscode-neovim/commit/f6cae671085cf61f33634f1efea4682b3325148d)), closes [#880](https://github.com/theol0403/vscode-neovim/issues/880) [#334](https://github.com/theol0403/vscode-neovim/issues/334)
* move readme to wiki ([39ccfec](https://github.com/theol0403/vscode-neovim/commit/39ccfec95f5af3a91c9a45a7effa51dba0ed5a9c))
* remove textDecorationsAtTop option ([#957](https://github.com/theol0403/vscode-neovim/issues/957)) ([a71aab8](https://github.com/theol0403/vscode-neovim/commit/a71aab894fbec6a77b7c937c824faf9a39013f3a))
* specify default nvim binary path ([#1047](https://github.com/theol0403/vscode-neovim/issues/1047)) ([3324941](https://github.com/theol0403/vscode-neovim/commit/33249413b6195afcef192185fe37fe5e8ee01722))
* support extmark_overlay ([#868](https://github.com/theol0403/vscode-neovim/issues/868)) ([17579f7](https://github.com/theol0403/vscode-neovim/commit/17579f71c8d6e8030d6ca6dcabfbe522f9737f96))


### Bug Fixes

* 106 ([b7f95e6](https://github.com/theol0403/vscode-neovim/commit/b7f95e6849bb052dca0a5fec0a69217e525e016d))
* 109 ([fd14885](https://github.com/theol0403/vscode-neovim/commit/fd148850bdfbacd1fe6fbf7587aaabdcf92437d2))
* 111 ([73ea0a3](https://github.com/theol0403/vscode-neovim/commit/73ea0a322a890d3baebba1f6d469a041f6cefb19))
* 112 ([e9025f1](https://github.com/theol0403/vscode-neovim/commit/e9025f1e7bfdef0a0737a3a7940db56bdee6cebd))
* 126 ([53987c1](https://github.com/theol0403/vscode-neovim/commit/53987c15e2a0951864e353c7103b2eb3f00133b5))
* 127 ([4723dad](https://github.com/theol0403/vscode-neovim/commit/4723dad5ab3f3ea5598a0eaf5159acf3a3be9b30))
* 142 ([29c9587](https://github.com/theol0403/vscode-neovim/commit/29c95870509232329f3906c5099dbc4ddfe1b1bc))
* 153 ([da5ac3f](https://github.com/theol0403/vscode-neovim/commit/da5ac3fb7af655bb90e07893912bc812e1b7744d))
* 72, adjust tests ([a7f9c6f](https://github.com/theol0403/vscode-neovim/commit/a7f9c6ff928cc2fb6c1c21ff4d902ac1363dab49))
* 81 ([45465eb](https://github.com/theol0403/vscode-neovim/commit/45465ebe0bbb231593153cddeb1ece52c159ea53))
* 95 ([b37ad13](https://github.com/theol0403/vscode-neovim/commit/b37ad13843374d9b675e7c91ae6e85b677393f41))
* **build:** cast to Error ([7ee4295](https://github.com/theol0403/vscode-neovim/commit/7ee42956f1ce794912335040fb322732fc8ed7d0))
* **build:** fix webpack watch task for live iteration ([2537576](https://github.com/theol0403/vscode-neovim/commit/253757630a75effe1566722ab01a50a673f9c108))
* **ci:** bump node version ([#862](https://github.com/theol0403/vscode-neovim/issues/862)) ([2b402ba](https://github.com/theol0403/vscode-neovim/commit/2b402bafba0a1a0358ac36d570590bbe1c9b29bf))
* **ci:** silence dbus warnings ([72d4e98](https://github.com/theol0403/vscode-neovim/commit/72d4e98eba1ec47d5a0796fb67eb6b9ec29ea828))
* **cmdline:** fix history and add paste bindings ([#908](https://github.com/theol0403/vscode-neovim/issues/908)) ([bae3a13](https://github.com/theol0403/vscode-neovim/commit/bae3a13d6d23e3e7caed2802522769f9f3abde45))
* cursor is left behind ([#305](https://github.com/theol0403/vscode-neovim/issues/305)) ([8b978f4](https://github.com/theol0403/vscode-neovim/commit/8b978f46e9f1ff2561b18738bb95cad84a306bd6))
* **cursor_manager:** fix mouse selection starts visual mode ([#1045](https://github.com/theol0403/vscode-neovim/issues/1045)) ([7b6193c](https://github.com/theol0403/vscode-neovim/commit/7b6193c54626f42a2d0c6771262ae666909a68b7))
* **cursor_manager:** fix mouse selection without starting visual mode ([#1055](https://github.com/theol0403/vscode-neovim/issues/1055)) ([2e74a3e](https://github.com/theol0403/vscode-neovim/commit/2e74a3ea40bee16938eb8f6e81a566bf1cbf54d6))
* **docs:** broken "Plugins" wiki link [#1017](https://github.com/theol0403/vscode-neovim/issues/1017) ([e3ea92c](https://github.com/theol0403/vscode-neovim/commit/e3ea92c90d96238453aea919ad600db6cd3ca774))
* fix cursor and highlight position related to long lines via `WinScrolled` autocmd ([#971](https://github.com/theol0403/vscode-neovim/issues/971)) ([e4bad89](https://github.com/theol0403/vscode-neovim/commit/e4bad89b3a9edf9c70a8db7d4590856c0ae1556a))
* fix mouse double click ([#870](https://github.com/theol0403/vscode-neovim/issues/870)) ([eb43451](https://github.com/theol0403/vscode-neovim/commit/eb4345126b1280046cba5ec06cf0b82f52495109))
* handle emoji characters ([#405](https://github.com/theol0403/vscode-neovim/issues/405)) ([#1083](https://github.com/theol0403/vscode-neovim/issues/1083)) ([9a06918](https://github.com/theol0403/vscode-neovim/commit/9a06918890c149a42f674ca14d6e09ac1b9c03e8))
* **highlight:** check highlight with blend for extmark ([#1075](https://github.com/theol0403/vscode-neovim/issues/1075)) ([7e3ad92](https://github.com/theol0403/vscode-neovim/commit/7e3ad92cf2cd69c2afb2c2724e0b2bde6a8c93ad))
* **highlight:** check overlay from config ([#1100](https://github.com/theol0403/vscode-neovim/issues/1100)) ([53ff096](https://github.com/theol0403/vscode-neovim/commit/53ff096ec44673bbdaa5e74814940ba96b99c32c))
* **highlight:** limit special emoji handing to where it's relevant ([#1097](https://github.com/theol0403/vscode-neovim/issues/1097)) ([#1099](https://github.com/theol0403/vscode-neovim/issues/1099)) ([40cbbac](https://github.com/theol0403/vscode-neovim/commit/40cbbac9a7f3e0e83c42f218f64065b6ddf125d2))
* **keymap:** let vscode handle ESC for findWidget, notificationCenter [#847](https://github.com/theol0403/vscode-neovim/issues/847) ([cd25749](https://github.com/theol0403/vscode-neovim/commit/cd25749e3481c13eeb481c7188901763548564f1))
* **lint:** 863 ([322c777](https://github.com/theol0403/vscode-neovim/commit/322c777b912e26540462beca3abedd179776ef89))
* **lint:** run lint ([d61279a](https://github.com/theol0403/vscode-neovim/commit/d61279ac52865524f6286dffd85f881edf27816a))
* **lint:** run prettier ([c5f2e13](https://github.com/theol0403/vscode-neovim/commit/c5f2e13560a079959a14cb6714354a94fc00da9f))
* **lint:** run prettier on all workspace files ([6864d28](https://github.com/theol0403/vscode-neovim/commit/6864d28f3e6422c86c70d745244ea3f1e5c18540))
* only cd to workspace folder if non-remote and non-wsl ([3d3a53d](https://github.com/theol0403/vscode-neovim/commit/3d3a53d17c0321d4a9c71940f31382fb6d53f2c0))
* remove check blend on overlay ([#1093](https://github.com/theol0403/vscode-neovim/issues/1093)) ([3acf29c](https://github.com/theol0403/vscode-neovim/commit/3acf29ce33b3685317292e50acc3351e591c3726))
* **scrolling:** fix c-u/c-y/c-f/c-b by deletion ([#885](https://github.com/theol0403/vscode-neovim/issues/885)) ([468b071](https://github.com/theol0403/vscode-neovim/commit/468b0710e8972fe11e312733d1eac12aa550eea4))
* **scrolling:** fix c-u/c-y/c-f/c-b by deletion ([#885](https://github.com/theol0403/vscode-neovim/issues/885)) ([29233d5](https://github.com/theol0403/vscode-neovim/commit/29233d5c9fad4fd5ea0cd4c8a14c7f50385a0cd2))
* settings.clean no longer overides settings.customInitFile ([#1016](https://github.com/theol0403/vscode-neovim/issues/1016)) ([a62547b](https://github.com/theol0403/vscode-neovim/commit/a62547bba197e19c20c8a869b3443b8e50f210dd))
* **test:** fix external buffer test ([9d4922b](https://github.com/theol0403/vscode-neovim/commit/9d4922b5a12f2008c0660ca3572f5112d95e8dce))
* **test:** force nvim to start in debug mode when running tests manually ([ea7b643](https://github.com/theol0403/vscode-neovim/commit/ea7b643d99d4f90e114fa3540b0b456ca78c8cc0))
* **typing_manager:** Non-English input method can replace chars ([#900](https://github.com/theol0403/vscode-neovim/issues/900)) ([e90a52a](https://github.com/theol0403/vscode-neovim/commit/e90a52a8a244958075cea2a8b11bbd4c2682e435))
* **typing_manager:** Optimize Non-English input method cause replace previous chars ([#1009](https://github.com/theol0403/vscode-neovim/issues/1009)) ([8440c7d](https://github.com/theol0403/vscode-neovim/commit/8440c7d48e93b9ee9e4e12255eb30ccdded98963))
* **viewport_manager:** better logging messages ([ff18dcd](https://github.com/theol0403/vscode-neovim/commit/ff18dcda78e3bfe292e1866c4683373ce5fa2c7b))
* **vscode-options:** set zero foldcolumn ([#916](https://github.com/theol0403/vscode-neovim/issues/916)) ([ac5403a](https://github.com/theol0403/vscode-neovim/commit/ac5403a280d6dff18e5cd8f564c70bf9ab9c57b3))
* **vscode:** fix opening files with :e without a workspace ([b4c6165](https://github.com/theol0403/vscode-neovim/commit/b4c61657ef9e4921a470e35851f0a07171e1d1d6))
* wrong VSCode selections if cursor is at start of selection [#1180](https://github.com/theol0403/vscode-neovim/issues/1180) ([f9bcd25](https://github.com/theol0403/vscode-neovim/commit/f9bcd2555c01ad238d9eca06f1c051c43ee71b15))

## [0.1.0](https://github.com/theol0403/vscode-neovim/compare/v0.0.96...v0.1.0) (2023-06-27)


### Features

* add $NVIM_APPNAME option ([#1186](https://github.com/theol0403/vscode-neovim/issues/1186)) ([5b54212](https://github.com/theol0403/vscode-neovim/commit/5b5421201701be67fc92d42b39fb049708b4d0f1))
* **ci:** add automatic releases ([9ecebdf](https://github.com/theol0403/vscode-neovim/commit/9ecebdf3a28f8ab22cc1cbf688feb7820d1d7669))


### Bug Fixes

* wrong VSCode selections if cursor is at start of selection [#1180](https://github.com/theol0403/vscode-neovim/issues/1180) ([f9bcd25](https://github.com/theol0403/vscode-neovim/commit/f9bcd2555c01ad238d9eca06f1c051c43ee71b15))

## [0.0.96]

-   fix issues with tabs creating visual glitches (#1099)

## [0.0.95]

-   fix navigation on lines with emojis (#1083)
-   fix random characters shown as an extmark overlay (#1075)

## [0.0.94]

-   revert accidentally-released scrolling PR (#885). This caused C-u/C-d to stop working as expected.

## [0.0.93]

-   fix mouse selection while not starting visual mode (#1055)

## [0.0.92]

-   allow vscode sync viewport with neovim (#919)
-   this makes lightspeed/leap work better. May cause some issues with jumping around. Will eventually be fixed by
    (#993)

## [0.0.91]

-   don't exit insert mode when switching tabs (#1050)
-   replay insert-mode edits in realtime using `nvim_buf_set_text` (#992)
-   when vscode reports changed document, changes get sent immediately to nvim
-   in insert mode, changes get sent immediately, instead of on exit

## [0.0.90]

-   Fix non-english input method issues (#1009)
-   list.toggleKeyboardNavigation => list.find (#1015)
-   Fix highlights not updating by :hi (#1010)
-   Add shortcut to navigate code action menu (#1029)
-   switch from yarn to npm (#1035)
-   specify default nvim binary path (#1047)
-   fix mouse selection starts visual mode (#1045)

## [0.0.89]

-   silence "No viewport for gridId" warning (#978)
-   improve readme, and add plugins to wiki (#969)
-   fix non-english input replacing chars in normal mode (#900)
-   improve compatibility with lightspeed/leap by fixing highlight provider (#982)

## [0.0.88]

-   add `--clean` option (#952)
-   remove `textDecorationsAtTop` (#957)
-   remove custom insert mode mappings, now C-w/C-u/C-r/etc are called natively (#886)
-   fix freezing after switching windows (#886)
-   fix cursor and highlight on long lines (#971)

## [0.0.87]

-   Command line improvements! Enable paste cmdline keybindings and fix history (#908) and fix path completions (#860)

## [0.0.86]

-   Fix bug with remote workspaces/WSL where plugin would try to set pwd to invalid path

## [0.0.85]

-   Show more messages in output ( #881, #902 )
-   Fix insert mode C-a ( #737 )
-   Improve efficiency applying small edits ( #830 )
-   Support extmark_overlay, adding hop/lightspeed/sneak support ( #868 )
-   Fix CI

## [0.0.84]

-   More keybinding improvements with notebook support ( #680 )
-   Small bugfixes and project maintenance ( #772, #723, #731 )

## [0.0.83]

-   Allow installation in Codespaces ( #262 )
-   Send visual selection with C-S-F ( #535 )

## [0.0.82]

-   Big updates to keybindings ! ( #513 , #654 , #557 , #585 , #655 )

## [0.0.81]

-   Revert ( #649 )

## [0.0.80]

-   Improve cursor position behaviour ( #649 )

## [0.0.79]

-   Fix infinity file opened loop on recent neovim versions ( #632 )

## [0.0.78]

-   Fix init error with no workspace folders open ( #526 )
-   Update README.md ( #527 )

## [0.0.77]

-   Fix cursor with tab indentation ( #516 , #515 )
-   Handle correctly WSL path with spaces ( #509 )

## [0.0.76]

-   Fix mutli-column character handling ( #503 )

## [0.0.75]

-   Improvements to cursor logic ( #501 )
-   Cancel current mode when switching editor ( #156 )

## [0.0.74]

-   Fix cursor logic ( #467 , #488 )
-   Trigger matching word highlight after movement ( #159 )
-   VIM highlight adjustments ( #482 )

## [0.0.73]

-   Improve cursor reveailing logic ( #479 )
-   Hook g0 / g\$ ( #455 )

## [0.0.72]

-   Fix undo regression introduced in `0.0.70`

## [0.0.71]

-   Fix `Unable to determine neovim windows id` error spam ( #418 )

## [0.0.70]

-   Use vscode jumplist actions instead of neovim
-   Fix uppercase marks ( #228 )
-   Various cursor & buffer management fixes ( #404 , #392 , #386 )
-   Implement manageEditorHeight and manageEditorWidth ( #444 )
-   Fix `<C-a>` in insert mode ( #283 )
-   Set vim cwd as vscode workspace ( #429 )
-   Fix shell-agnostic WSL integration ( #147 )
-   Map :x to Wq ( #396 )
-   Various docs contributions
-   Improve build ( #378 )

## [0.0.63]

-   Allow to put text decorations (usually EasyMotion ones) at top setting (`vscode-neovim.textDecorationsAtTop`) ( #358
    ), contributed by @jhgarner
-   Fix incorrect `<C-w><C-w>/<C-w>w` mappings ( #359 ), contributed by @tschaei
-   Replace/modernize neovim vscode command line interop mappings by `<Cmd>call` ( #362 ), contributed by @theol0403
-   Fix incorrect `<C-w>gf` mapping ( #365 ), contributed by @Yuuki77
-   Fix applying vim HL (such as `MatchParen`) at end of a line ( #371 )
-   Fix incorrect cursor position when selecting next/prev search result ( #366 )
-   Fix/improve behavior of auto-accepting vim return prompt `Press enter to continue`. In some cases it was excess (
    #372 )
-   Bundle extension by webpack ( #377 )

## [0.0.62]

-   Fix jumplist ( #350 )
-   Add `K` and `gO` mappings (mapped to `showHover` and `goToSymbol`) ( #108 ) (@Shatur95)
-   Fix images/icon (@Shatur95)

## [0.0.60/61]

Started from this version `neovim 0.5` nightly version is required Many things have been refactored/changed internally
in this release. So if you see any regression - please fill an issue

-   Turn on VIM smartindenting/autoindenting and remove custom vscode bindings to `o`/`O` (so it uses VIM ones)
-   New buffer,window and cursor management. This makes the extension finally work with git diff view, peek views,
    search editor views and even in output channels! ( #53 , #187 , #220 , #223, #226)
-   Implement multi-line messages pager. Things like `:registers`, `:changes`, `:jumps`, `:messages` are working
    correctly now ( #202 , #78 , #296 )
-   Fix tab indent problems and sync vscode tab settings with neovim ( #275 , #239 , #264 , #167 , #100 , #152 , #289 )
-   Fix few macro recording problems ( #207 )
-   Fix ghost keys after exiting insert mode ( #324 ). For `jj` / `jk` users there are still few problems ( #330 ) but
    they will be sorted in next releases
-   Fix few command line problems ( #155 , #288 )
-   Fix some buffer desync issues ( #312 )
-   Fix `<C-w>v/<C-w>s` split shortcuts ( #331 )
-   Fix brackets for substitute command ( #300 )
-   Add logger and log-related configuration to options
-   Change some default code-actions mappings ( #339 )
-   Add extension icon. Many thanks to <https://github.com/ngscheurich>

## [0.0.52]

-   Implement dot repeat (`.`) command ( #209 , #173 ). Also fixes `<count>` insert comamnds, like #255 , #249
-   Removed file name from statusbar ( #291 , #230 ), thanks @Shatur95
-   Fix visual selection conversion ( #233 ), thanks @Shatur95
-   Fix wrong string comparsions ( #308 ), thanks @Shatur95
-   Make espace keys work only when editor has focus ( #290 ) , thanks @David-Else
-   Added some file name completion in commandline ( #192 ), thanks @ppwwyyxx
-   Fix missing `<C-w>c` mapping ( #180 ), thanks @trkoch
-   Add operating system dependent path settings ( #137 ), thanks @3nuc
-   bind gh to mousehover ( #107 ), thanks @kwonoj

## [0.0.50]

-   Fix cursor & extension hang for some cases ( #153 )

## [0.0.49]

-   Use command line completion only for command line originated via `:` command ( #146 )

## [0.0.48]

-   Fix incorrect cursor for multibyte single column width characters ( #142 )
-   Fix vim-easymotion decorators drifting when text has multi-byte characters ( #144 )
-   Disabled vim modeline processing
-   Force vim folds to be always opened to prevent problems
-   Fix vim-easymotion decorators drifting to the end of line ( #60 )
-   Fix incorrect cursor positions after commands/mappings such as `>gv` ( #141 )
-   Fix double command prompt ( #120 )

## [0.0.47]

-   Fix the problem when cursor/extension stucks for second+ editor columns ( #126 )

## [0.0.46]

-   Update `neovim-client` to latest version. This should eliminate delay between operations and generally improve the
    performance. Kudos to @kwonoj for impressive work here
-   Fix cursor movement for 2-byte chars ( #127 )

## [0.0.45]

-   Fix VIM filetype detection ( #115 ). This means `FileType` autocmd should work correctly now. Also fixes
    `vim-matchup` plugin. This may introduce some side effects from previously disabled filetype plugins - just fill an
    issue if something doesn't work
-   Fix broken cursor position in insert mode for special keys (such as `del`/`backspace`/etc) if you had recorded a
    macro in insert mode previously

## [0.0.44]

-   Hotfix broken `VSCodeCallRange` (commenting/formatting didn't work because of this)

## [0.0.43]

-   Visual modes DON'T produce vscode selections right now. These were implemented through various workarounds, gave
    really small value and were constant origin of headache. Also this fixes few issues related to visual modes ( #105,
    #118 ). To round the corners, invoking vscode's command palette (by using default vscode hotkeys) from visual mode
    will convert neovim visual selection to vscode visual selection, this should cover most use cases. Also, there are
    `VScodeNotifyRange`/`VSCodeCallRange`/`VSCodeNotifyRangePos`/`VSCodeCallRangePos` vim functions if you need to call
    vscode command with selection. See
    [this for example](https://github.com/asvetliakov/vscode-neovim/blob/e61832119988bb1e73b81df72956878819426ce2/vim/vscode-code-actions.vim#L42-L54)
    and
    [mapping](https://github.com/asvetliakov/vscode-neovim/blob/e61832119988bb1e73b81df72956878819426ce2/vim/vscode-code-actions.vim#L98)
    if you're doing custom mappings and assuming there is some vscode selection exist. Use `VSCodeNotifyRange` when you
    don't need a column pos (e.g. for visual line mode) and `VSCodeNotifyRangePos` when you need them (e.g for visual
    mode).
-   Refactored vscode<->neovim cursor syncrhonization
-   Fix `ma`/`mi` not working when selecting lines upward ( #117 )
-   Changed `ma`/`mi` to skip empty lines. Added `mA`/`mI` for the previous behavior
-   Macro recording fixes
-   Refactored & optimized HL provider (highlight should be faster now)
-   Override default keybindings only when neovim was initialized succesfully ( #112 )
-   Don't preselect `'<,'>` marks when invoking cmdline from visual line ( #111 )
-   Implemented commandline history ( #88 )
-   Add the option to start the visual mode with mouse selection ( #94 )

## [0.0.42]

-   Disabled jj/jk escape keys by default

## [0.0.40]

-   Fix cursor/highlight not working with multi-byte width characters (Russian, Chinese, Japanese, etc...), i.e the
    extension should work normally with them (#68, #91)
-   Fix incorrect vim highlight when using tab indentation (#81)
-   Removed multiple cursors by default from visual line/block modes (visual block mode still spawns cursors but they
    are pruly visual) (#59, #61). Previous behavior is still accessible by `mi` or `ma` keybindings while in visual
    line/block modes
-   Allow to override keys/mappings set by extension (previously they have been set after user config loaded)
-   Allow to identify if neovim is running through vscode extension by checking `if exists('g:vscode')` (#83)
-   Added `<C-[>` and `Escape` as escape keys (#74)
-   Added `<C-n>` and `<C-p>` to select next autocomplete suggestion/show next/prev parameter hint
-   Added `jj` and `jk` as escape keys from the insert mode (#75)
-   Pass `<C-/>` to neovim and call VSCodeCommentary (still recommended to bind it to own keys) (#89)
-   Pass `<S-Tab>` to neovim
-   Allow to pass additional ctrl keys to neovim (see Readme)
-   Added workaround for `gk`/`gj` motions
-   Corrected `gf`/`gF` keybindings. Add `<C-]>` as go-to-def (works in help too) (#77). Add `gd`/`gD` as secondary
    mappings to go-to-def/peek-def. Add `<C-w>gd` to reveal definition aside

## [0.0.39]

-   Fix bug with incorrect buffer edits
-   Fix cursor jumping after pressing something like `cw` and fast typing text in large file

## [0.0.38]

-   Fix cursor position after deleting a line and possibly other operations

## [0.0.37]

-   Fix performance of o/O. If you're using custom bindings for them, you might need to rebind them to call new action.
    See vscode-insert.vim

## [0.0.36]

-   Fix macros with insert mode
-   Big performance improvements, fix undo & macros performance
-   Allow to use neovim installed in WSL. Tick useWSL conf checkbox and specify linux path to neovim

## [0.0.35]

-   Use VIM jumplist for `<C-o>`/`<C-i>`/`<Tab>`

## [0.0.33-0.0.34]

-   Fix extension for linux/macos users
-   Fix buffer-vscode desynchornization after redo

## [0.0.32]

-   Cmdline fixes/improvements (#50, #51)

## [0.0.31]

-   Fix crazy cursor jumping when having opened multiple editors panes

## [0.0.30]

-   Implemented nvim's ext_multigrid support. This solves almost all problems with vim highlighting and potentially
    enables easymotion's overwin motions (they still don't work however). Window management still should be performed by
    vscode
-   Removed vim-style cursor following on editor scrolling. This totally screwed vscode jumplist, so better to have
    working jumplist than such minor feature.
-   Cursor position fixes
-   `:e [filepath]` works again

## [0.0.29]

-   Fix selection is being reset in visual mode after typing `vk$` (#48)
-   Fix not cleaning incsearch highlight after canceling the incsearch (#46)
-   Fix incorrect cursor after switching the editor to the same document but in different editor column (#49)

## [0.0.28]

-   Use non-blocking rpc requests when communicatings with vscode for file management operations (closing, opening,
    etc...). Should eliminate the issue when vim is 'stuck' and doesn't respond anymore
-   Fix incorrect cursor positions after opening `:help something` (#44)
-   Fix visual block selection for single column in multiple rows (#42)
-   Enable VIM syntax highlighting for help files and external buffers like `:PlugStatus`. It's slow and sometimes buggy
    but better than nothing in meantime

## [0.0.27]

-   Fix incsearch and allow to use `<C-t>`/`<C-g>` with it
-   Reworked/Refactored command line. Now with wildmenu completion support. Also keys like `<C-w>` or `<C-u>` are
    working fine now in cmdline now

## [0.0.26]

-   Partially revert #41

## [0.0.25]

-   Tab management commands & keys, like `gt` or `tabo[nly]`
-   Window management commands & keys like `sp[lit]`/`vs[plit]` and `<C-w> j/k/l/h` keys
-   Bind scroll commands in neovim instead of vscode extension
    ([#41](https://github.com/asvetliakov/vscode-neovim/issues/41))

## [0.0.24]

-   File management commands, like `:w` or `:q` (bound to vscode actions)
-   Fix [#40](https://github.com/asvetliakov/vscode-neovim/issues/40)

## [0.0.1-0.0.23]

-   A bunch of development versions. 0.0.23 has the following features
-   Correct editing and the cursor management
-   Control keys in the insert & normal/visual modes
-   Visual mode produces vscode selections
-   Working VIM highlighting (most of a default VIM HL groups are ignored since they don't make sense in VSCode, but non
    standard groups are processed, so things like vim-easymotion or vim-highlight are working fine)
-   Scrolling commands (scrolling is done by vscode so things are slighly different here)
-   Special vim-easymotion fork to use vscode text decorators instead of replacing text (as original vim-easymotion
    does)
-   Analogue of vim-commentary (original vim-commentary works fine too)
-   Working external vim buffers, like `:help` or `:PlugStatus`
-   Multiple cursors for visual line/visual block modes

## [0.0.1]

-   Initial release
