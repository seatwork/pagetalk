class PageTalk {
    /**
     * options: { container, [className,] appId, appKey }
     * sanitize and sanitizer parameters are deprecated since marked version 0.7.0
     * but sanitize is very useful for me.
     */
    constructor(options) {
        this.importScripts([
            'https://cdn.jsdelivr.net/npm/blueimp-md5@2.18.0/js/md5.min.js',
            'https://cdn.jsdelivr.net/npm/marked@0.6.3/marked.min.js'
        ]).then(() => {
            marked.setOptions({
                sanitize: true
            })
            this.className = options.className || 'PageTalk_Comment'
            this.lcs = new LeanCloudStorage(options)
            this.listComments()
        })

        this.emailReg = /^[a-zA-Z0-9_\-\.]+\@[a-zA-Z0-9_\-\.]+\.([a-zA-Z]{2,8})$/
        this.urlReg = /^https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z0-9\-\.]+(\:\d+)?[\w\-\/\.@?=%&+#]*$/
        this.avatar = 'https://cn.gravatar.com/avatar/'
        this.onMessage = options.onMessage || function() {}
        this.createHeader(options.container)
    }

    createHeader(container) {
        container = document.querySelector(container)
        if (container.inited) return

        const user = this.loadLastUser()
        const header = this._(`<div class="pgtk-container"><div class="pgtk-section"><div class="pgtk-avatar"><img src="${user.avatar}"/></div><div class="pgtk-form"><div class="pgtk-form-inputs"><input type="text" id="pgtk-nickname" value="${user.nickname}" maxlength="20" placeholder="昵称 (必填)"><input type="text" id="pgtk-email" value="${user.email}" maxlength="50" placeholder="邮箱 (可选, 用于显示全球头像)"><input type="text" id="pgtk-website" value="${user.website}" maxlength="50" placeholder="网站 (可选)"></div><div class="pgtk-textarea pgtk-markdown" placeholder="不说点什么就说不过去..." contenteditable="plaintext-only"></div><div class="pgtk-controls"><div class="pgtk-badge"><a target="_blank" href="https://guides.github.com/features/mastering-markdown/"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1024" height="18"><path d="M1188 906H92c-51 0-92-42-92-92V210c0-50 41-92 92-92h1096c51 0 92 42 92 92v604c0 50-41 92-92 92zM308 721V481l123 154 123-154v240h123V303H554L431 457 308 303H185v418h123zm824-209h-123V303H886v209H763l185 215 184-215z"/></svg></a><a target="_blank" href="https://seatwork.github.io/pagetalk"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82 13" height="10"><path d="M1 1.3l.1-.3h4.1q5 0 5 4 0 2-1.4 3-1.3 1.1-3.7 1.1H3.8v2.6l-.1.3-.3.1H1l-.1-.4zm4 5.2q1.1 0 1.7-.3.5-.4.5-1.2 0-.8-.5-1.2-.5-.3-1.6-.3H3.8V6.5H4zM13.8 1.5q.2-.5.4-.6l.4-.2.4.2.5.6 5 10v.4q0 .2-.3.2h-2.5l-.2-.4-.6-1.3-.2-.2h-4.3l-.1.2-.6 1.3q-.1.3-.3.3l-.4.1H9q-.3 0-.3-.2v-.3zM15.5 8l.1-.1v-.2l-1-2.2-1 2.2-.1.2h.2zM28 7v-.4l.4-.1h2l.3.1V11l-.3.2q-1 .6-2.2.9-1 .2-2.2.2-1.7 0-3-.7-1.4-.7-2.2-2-.8-1.3-.8-3t.8-3q.8-1.4 2.2-2.2Q24.4.7 26 .7q1.2 0 2.3.3 1 .4 1.9 1 .3.1.3.3l-.1.4-.9 1.2-.1.2H29q-1.4-.8-2.9-.8-1 0-1.7.4t-1 1.2q-.5.7-.5 1.6 0 1 .4 1.7.4.8 1.1 1.2.7.4 1.6.4 1 0 1.7-.3l.2-.1v-.2zM32 1.3l.1-.3H39.2q.4 0 .4.3v2.1H35l-.2.1v1.7H38.7l.3.1v2.4H35l-.2.1v1.7h4.3q.2 0 .3.2l.1.3v1.7q0 .4-.4.4H32.1v-.4zM45.5 3.7v-.2H42.6l-.3-.1V1.3 1H51.4v2.4h-2.9l-.2.1v8.2l-.1.3-.3.1h-2.3l-.1-.4zM54.9 1.5q.2-.5.4-.6l.4-.2.4.2.5.6 5 10v.4q0 .2-.3.2h-2.5l-.2-.4-.7-1.3v-.2h-4.3-.1l-.1.2-.6 1.3q-.1.3-.3.3l-.4.1h-2q-.3 0-.3-.2v-.3zM56.6 8l.1-.1v-.2l-1-2.2-1 2.2-.1.2h.1zM62.5 1.3V1h2.6q.2.1.2.3v8.2h4.3q.2 0 .3.2l.1.3v2l-.4.1h-7l-.1-.4zM70.9 1.3V1H73.7V12l-.4.1H71l-.1-.4zM74 6.8l-.2-.3.2-.4 3.3-4.8.4-.3H80.5l.3.1v.3l-3.8 5 3.9 5.3.1.2-.1.2H77.8l-.3-.4z"/></svg></a></div><button class="pgtk-submit">评论</button><button class="pgtk-preview">预览</button></div></div></div><div class="pgtk-message"></div><div id="pgtk-comment-list"></div></div>`)

        header.querySelector('.pgtk-submit').addEventListener('click', e => this.addComment(e))
        header.querySelector('.pgtk-preview').addEventListener('click', e => this.switchPreview(e))
        container.appendChild(header)
        container.inited = true

        this.element = {
            nickname: header.querySelector('#pgtk-nickname'),
            email: header.querySelector('#pgtk-email'),
            website: header.querySelector('#pgtk-website'),
            textarea: header.querySelector('.pgtk-textarea'),
            message: header.querySelector('.pgtk-message'),
            submit: header.querySelector('.pgtk-submit'),
            preview: header.querySelector('.pgtk-preview'),
            comments: header.querySelector('#pgtk-comment-list')
        }
    }

    async listComments() {
        this.setMessage(`正在加载...`)
        const res = await this.lcs.queryObjects(`select * from ${this.className} where pageId = '${location.pathname}' order by createdAt desc`)
        if (res.error) {
            return this.setMessage(res.error, true)
        }

        this.setMessage(`共 ${res.results.length} 条评论`)
        res.results.forEach(comment => {
            const markedComment = this.markComment(comment)
            const section = this.createSection(markedComment)
            this.element.comments.appendChild(section)
        })
    }

    // comment: { nickname, email, website, content }
    async addComment(e) {
        const textarea = this.element.textarea
        const comment = {
            nickname: this.element.nickname.value.trim(),
            email: this.element.email.value.trim(),
            website: this.element.website.value.trim(),
            content: (textarea.orginalContent || textarea.textContent).trim(),
            pageId: location.pathname
        }
        let res = this.verifyFormData(comment)
        if (res !== true) {
            return this.setMessage(res, true)
        }

        this.element.submit.disabled = true
        res = await this.lcs.insertObject(this.className, comment)
        this.element.submit.disabled = false
        if (res.error) {
            return this.setMessage(res.error, true)
        }

        comment.objectId = res.objectId
        comment.createdAt = res.createdAt
        const markedComment = this.markComment(comment)
        const section = this.createSection(markedComment)
        const list = this.element.comments.children

        if (list.length === 0) {
            this.element.comments.appendChild(section)
        } else {
            this.element.comments.insertBefore(section, list[0])
        }

        this.setMessage(`共 ${list.length} 条评论`)
        this.clearPreview()
        this.saveLastUser(markedComment)
        this.onMessage(markedComment)
    }

    createSection(comment) {
        const item = this._(`<div class="pgtk-section"><div class="pgtk-avatar"><img src="${comment.avatar}"/><div class="pgtk-triangle"></div></div><div class="pgtk-comment"><div class="pgtk-profile"><div><a target="_blank" href="${comment.website}">${comment.nickname}</a> 发表于 ${comment.createdAt}</div><svg id="pgtk-reply-icon" viewBox="0 0 1332 1024" width="14"><path d="M529.066665 273.066666 529.066665 0 51.2 477.866666 529.066665 955.733335 529.066665 675.84C870.4 675.84 1109.333335 785.066665 1280 1024 1211.733335 682.666665 1006.933335 341.333334 529.066665 273.066666"></path></svg></div><div class="pgtk-markdown">${comment.htmlContent}</div></div></div>`)
        item.querySelector('#pgtk-reply-icon').addEventListener('click', e => this.reply(comment))
        return item
    }

    reply(comment) {
        const lines = comment.content.split('\n')
        lines.forEach((line, i) => lines[i] = '> ' + line) // Add quote markdown tag
        lines.unshift('> @' + comment.nickname) // Add reply to who tag
        lines.push('\n\n') // Add break lines

        this.element.textarea.textContent = lines.join('\n')
        this.moveCursorToEnd(this.element.textarea)
    }

    switchPreview() {
        const textarea = this.element.textarea
        if (textarea.isContentEditable) {
            textarea.setAttribute('contenteditable', false)
            textarea.orginalContent = textarea.textContent
            textarea.innerHTML = marked(textarea.textContent)
            this.element.preview.innerHTML = '编辑'
        } else {
            textarea.setAttribute('contenteditable', 'plaintext-only')
            textarea.textContent = textarea.orginalContent
            textarea.orginalContent = ''
            this.element.preview.innerHTML = '预览'
            this.moveCursorToEnd(textarea)
        }
    }

    clearPreview() {
        const textarea = this.element.textarea
        textarea.textContent = textarea.orginalContent = ''
        if (!textarea.isContentEditable) {
            textarea.setAttribute('contenteditable', 'plaintext-only')
            this.element.preview.innerHTML = '预览'
        }
    }

    markComment(comment) {
        comment.avatar = this.avatar + md5(comment.email)
        comment.createdAt = this.formatDate(comment.createdAt)
        comment.htmlContent = marked(comment.content)
        return comment
    }

    verifyFormData(comment) {
        if (!comment.nickname) {
            return '昵称不能为空'
        }
        if (comment.nickname.match(/[\<\>]+/)) {
            return '昵称不能包含尖括号'
        }
        if (comment.email && !comment.email.match(this.emailReg)) {
            return '邮箱格式有误'
        }
        if (comment.website && !comment.website.match(this.urlReg)) {
            return '网站格式有误'
        }
        if (!comment.content) {
            return '评论内容不能为空'
        }
        if (comment.content.length > 2000) {
            return '评论内容超过 2000 字限制'
        }
        return true
    }

    setMessage(message, isError = false) {
        this.element.message.innerHTML = message
        if (isError) {
            this.element.message.classList.add('pgtk-error')
        } else {
            this.element.message.classList.remove('pgtk-error')
        }
    }

    saveLastUser(comment) {
        localStorage.setItem('pagetalk-user', JSON.stringify({
            nickname: comment.nickname,
            email: comment.email,
            website: comment.website,
            avatar: comment.avatar
        }))
    }

    loadLastUser() {
        const user = JSON.parse(localStorage.getItem('pagetalk-user')) || {}
        user.nickname = user.nickname || ''
        user.email = user.email || ''
        user.website = user.website || ''
        user.avatar = user.avatar || this.avatar
        return user
    }

    formatDate(time) {
        time = (new Date(time)).getTime() + 8 * 3600 * 1000
        return (new Date(time)).toJSON().substr(0, 10).replace(/\-/g, '/')
    }

    moveCursorToEnd(element) {
        element.focus()
        element.scrollTop = element.scrollHeight - element.clientHeight

        if (window.getSelection) { // ie11 10 9 ff safari
            const range = window.getSelection()
            range.selectAllChildren(element)
            range.collapseToEnd()
        } else if (document.selection) { // ie10 9 8 7 6 5
            const range = document.selection.createRange()
            range.moveToElementText(element)
            range.collapse(false)
            range.select()
        }
    }

    importScripts(urls) {
        return new Promise((resolve, reject) => {
            const head = document.getElementsByTagName('head')[0]
            const load = i => {
                const script = document.createElement('script')
                script.setAttribute('type', 'text/javaScript')
                script.setAttribute('src', urls[i])
                script.onload = script.onerror = () => {
                    i++
                    if (i === urls.length) resolve()
                    else load(i)
                }
                head.appendChild(script)
            }
            load(0)
        })
    }

    _(selector) {
        selector = selector.replace('/\n/mg', '').trim()
        if (selector.startsWith('<')) {
            const fragment = document.createRange().createContextualFragment(selector)
            return fragment.firstChild
        }
        return document.querySelector(selector)
    }
}

class LeanCloudStorage {
    constructor(options) {
        this.api = 'https://avoscloud.com/1.1'
        this.defaultHeaders = {
            'X-LC-Id': options.appId,
            'X-LC-Key': options.appKey,
            'Content-Type': 'application/json'
        }
    }

    async queryObjects(cql) {
        return await this.tryFetch(`/cloudQuery?cql=${cql}`)
    }

    async getObjects(className) {
        return await this.tryFetch(`/classes/${className}`)
    }

    async insertObject(className, object) {
        return await this.tryFetch(`/classes/${className}`, {
            method: 'POST',
            body: JSON.stringify(object)
        })
    }

    async deleteObject(className, objectId) {
        return await this.tryFetch(`/classes/${className}/${objectId}`, {
            method: 'DELETE'
        })
    }

    async tryFetch(url, options = {}) {
        options.headers = this.defaultHeaders
        try {
            const response = await fetch(this.api + url, options)
            return await response.json()
        } catch (e) {
            return {
                error: e.message
            }
        }
    }
}
