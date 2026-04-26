import { Router } from 'express'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import path from 'path'

const router = Router()
const execAsync = promisify(exec)

/**
 * 获取系统下载目录
 */
router.get('/download-folder', (req, res) => {
  try {
    const homeDir = os.homedir()
    const platform = os.platform()
    
    let downloadPath: string
    
    if (platform === 'darwin') {
      downloadPath = path.join(homeDir, 'Downloads')
    } else if (platform === 'win32') {
      downloadPath = path.join(homeDir, 'Downloads')
    } else {
      downloadPath = path.join(homeDir, 'Downloads')
    }
    
    // 获取请求中的子目录参数
    const subFolder = req.query.subFolder as string
    if (subFolder) {
      downloadPath = path.join(downloadPath, subFolder)
    }
    
    res.json({
      success: true,
      path: downloadPath
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取下载目录失败'
    })
  }
})

/**
 * 打开文件夹选择对话框
 */
router.post('/select-folder', async (req, res) => {
  try {
    const platform = os.platform()
    let folderPath: string = ''
    
    if (platform === 'darwin') {
      // macOS - 使用 osascript 打开文件夹选择对话框
      const script = `
        tell application "System Events"
          activate
        end tell
        tell application "Finder"
          activate
          set selectedFolder to choose folder with prompt "请选择保存文件夹"
          return POSIX path of selectedFolder
        end tell
      `
      const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`, {
        timeout: 60000
      })
      folderPath = stdout.trim()
    } else if (platform === 'win32') {
      // Windows - 使用 PowerShell
      const script = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $folder = New-Object System.Windows.Forms.FolderBrowserDialog; $folder.Description = '请选择保存文件夹'; $folder.ShowNewFolderButton = $true; if ($folder.ShowDialog() -eq 'OK') { $folder.SelectedPath }"`
      const { stdout } = await execAsync(script, { timeout: 60000 })
      folderPath = stdout.trim()
    } else {
      // Linux - 使用 zenity
      try {
        const { stdout } = await execAsync('zenity --file-selection --directory --title="请选择保存文件夹"', { timeout: 60000 })
        folderPath = stdout.trim()
      } catch {
        // 如果 zenity 不可用，尝试 kdialog
        const { stdout } = await execAsync('kdialog --getexistingdirectory', { timeout: 60000 })
        folderPath = stdout.trim()
      }
    }
    
    if (folderPath && folderPath.length > 0) {
      res.json({
        success: true,
        path: folderPath
      })
    } else {
      res.json({
        success: false,
        error: '未选择文件夹'
      })
    }
  } catch (error) {
    // 用户取消选择时会报错
    res.json({
      success: false,
      error: '用户取消选择'
    })
  }
})

export { router as systemRoutes }
