class PageTalk {
    /**
     * options: { container, [className,] appId, appKey }
     * sanitize and sanitizer parameters are deprecated since marked version 0.7.0
     * but sanitize is very useful for me.
     */
    constructor(options) {
        this.importScript('https://cdn.jsdelivr.net/npm/blueimp-md5@2.18.0/js/md5.min.js')
        this.importScript('https://cdn.jsdelivr.net/npm/marked@0.6.3/marked.min.js', () => {
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
        this.createHeader(options.container)
    }

    createHeader(container) {
        const user = this.loadLastUser()
        const header = this._(`
        <div class="pgtk-container">
          <div class="pgtk-section">
            <div class="pgtk-avatar"><img src="${user.avatar}"/></div>
            <div class="pgtk-form">
              <div class="pgtk-form-inputs">
                <input type="text" id="pgtk-nickname" value="${user.nickname}" maxlength="20" placeholder="昵称 (必填)">
                <input type="text" id="pgtk-email" value="${user.email}" maxlength="50" placeholder="邮箱 (可选, 用于显示全球头像)">
                <input type="text" id="pgtk-website" value="${user.website}" maxlength="50" placeholder="网站 (可选)">
              </div>
              <div class="pgtk-textarea pgtk-markdown" placeholder="不说点什么就说不过去..." contenteditable="plaintext-only"></div>
              <div class="pgtk-controls">
                <div><a target="_blank" href="https://guides.github.com/features/mastering-markdown/"><svg viewBox="0 0 16 16" version="1.1" width="20" height="20"><path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"></path></svg></a></div>
                <button class="pgtk-submit">评论</button>
                <button class="pgtk-preview">预览</button>
              </div>
            </div>
          </div>
          <div class="pgtk-message"></div>
          <div id="pgtk-comment-list"></div>
        </div>`)

        header.querySelector('.pgtk-submit').addEventListener('click', e => this.addComment(e))
        header.querySelector('.pgtk-preview').addEventListener('click', e => this.switchPreview(e))
        document.querySelector(container).appendChild(header)

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
            const section = this.createSection(comment)
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
        const section = this.createSection(comment)
        const list = this.element.comments.children

        if (list.length === 0) {
            this.element.comments.appendChild(section)
        } else {
            this.element.comments.insertBefore(section, list[0])
        }

        this.setMessage(`共 ${list.length} 条评论`)
        this.clearPreview()
        this.saveLastUser(comment)
    }

    createSection(comment) {
        // Transform comment data
        const avatar = this.avatar + md5(comment.email)
        const createDate = this.formatDate(comment.createdAt)
        const content = marked(comment.content)

        const item = this._(`
        <div class="pgtk-section">
          <div class="pgtk-avatar">
            <img src="${avatar}"/><div class="pgtk-triangle"></div>
          </div>
          <div class="pgtk-comment">
            <div class="pgtk-profile">
              <div><a target="_blank" href="${comment.website}">${comment.nickname}</a> 发表于 ${createDate}</div>
              <svg id="pgtk-reply-icon" viewBox="0 0 1332 1024" width="14"><path d="M529.066665 273.066666 529.066665 0 51.2 477.866666 529.066665 955.733335 529.066665 675.84C870.4 675.84 1109.333335 785.066665 1280 1024 1211.733335 682.666665 1006.933335 341.333334 529.066665 273.066666"></path></svg>
            </div>
            <div class="pgtk-markdown">${content}</div>
          </div>
        </div>`)
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
            avatar: this.avatar + md5(comment.email)
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

    importScript(url, callback) {
        const script = document.createElement('script')
        script.setAttribute('type', 'text/javaScript')
        script.setAttribute('src', url)
        script.addEventListener('load', callback)
        document.getElementsByTagName('head')[0].appendChild(script)
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
