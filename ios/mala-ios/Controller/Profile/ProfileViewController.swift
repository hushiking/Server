//
//  ProfileViewController.swift
//  mala-ios
//
//  Created by Elors on 12/18/15.
//  Copyright © 2015 Mala Online. All rights reserved.
//

import UIKit

private let ProfileViewTableViewCellReuseID = "ProfileViewTableViewCellReuseID"

class ProfileViewController: UITableViewController, UIImagePickerControllerDelegate, UINavigationControllerDelegate, ProfileViewHeaderViewDelegate {
    
    // MARK: - Property
    /// [个人中心结构数据]
    private var model: [[ProfileElementModel]] = MalaConfig.profileData()
    
    
    // MARK: - Components
    /// [个人中心]头部视图
    private lazy var profileHeaderView: ProfileViewHeaderView = {
        let profileHeaderView = ProfileViewHeaderView(frame: CGRect(x: 0, y: 0, width: MalaScreenWidth, height: MalaLayout_ProfileHeaderViewHeight))
        profileHeaderView.name = MalaUserDefaults.studentName.value ?? "学生姓名"
        profileHeaderView.delegate = self
        return profileHeaderView
    }()
    /// [个人中心]底部视图
    private lazy var profileFooterView: UIView = {
        let profileFooterView = UIView(frame: CGRect(x: 0, y: 0, width: 0, height: 55))
        return profileFooterView
    }()
    /// 顶部背景图
    private lazy var headerBackground: UIImageView = {
        let image = UIImageView(image: UIImage(named: "profile_headerBackground"))
        image.contentMode = .ScaleAspectFill
        return image
    }()
    /// [退出登录] 按钮
    private lazy var logoutButton: UIButton = {
        let logoutButton = UIButton()
        
        logoutButton.layer.cornerRadius = 5
        logoutButton.layer.masksToBounds = true
        logoutButton.layer.borderColor = MalaColor_E5E5E5_0.CGColor
        logoutButton.layer.borderWidth = MalaScreenOnePixel
        
        logoutButton.setTitle("退出登录", forState: .Normal)
        logoutButton.setTitleColor(MalaColor_82B4D9_0, forState: .Normal)
        logoutButton.setBackgroundImage(UIImage.withColor(UIColor.whiteColor()), forState: .Normal)
         logoutButton.setBackgroundImage(UIImage.withColor(UIColor(rgbHexValue: 0xE5E5E5, alpha: 0.3)), forState: .Highlighted)
        logoutButton.titleLabel?.font = UIFont.systemFontOfSize(MalaLayout_FontSize_16)
        
        logoutButton.addTarget(self, action: #selector(ProfileViewController.logoutButtonDidTap), forControlEvents: .TouchUpInside)
        return logoutButton
    }()
    /// 照片选择器
    private lazy var imagePicker: UIImagePickerController = {
        let imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        imagePicker.allowsEditing = true
        return imagePicker
    }()
    
    

    // MARK: - Life Cycle
    override func viewDidLoad() {
        super.viewDidLoad()

        println("UserToken is \(MalaUserDefaults.userAccessToken.value)")
        println("profileID is \(MalaUserDefaults.profileID.value)")
        println("parentID is \(MalaUserDefaults.parentID.value)")
        println("studentName is \(MalaUserDefaults.studentName.value)")
        configure()
        setupUserInterface()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        
        // 每次显示[个人]页面时，刷新个人信息
        model = MalaConfig.profileData()
        tableView.reloadData()
        profileHeaderView.refreshDataWithUserDefaults()
    }
    
    // MARK: - Private Method
    private func configure() {
                
        // register
        tableView.registerClass(ProfileViewCell.self, forCellReuseIdentifier: ProfileViewTableViewCellReuseID)
    }
    
    private func setupUserInterface() {
        // Style
        tableView.tableHeaderView = profileHeaderView
        tableView.tableFooterView = profileFooterView
        tableView.backgroundColor = MalaColor_F2F2F2_0
        tableView.separatorStyle = .None
        
        // SubViews
        tableView.insertSubview(headerBackground, atIndex: 0)
        profileFooterView.addSubview(logoutButton)
        
        
        // Autolayout
        headerBackground.snp_makeConstraints { (make) -> Void in
            make.top.equalTo(0)
            make.centerX.equalTo(self.tableView.snp_centerX)
            make.width.equalTo(MalaScreenWidth)
            make.height.equalTo(MalaLayout_ProfileHeaderViewHeight)
        }
        logoutButton.snp_makeConstraints { (make) -> Void in
            make.bottom.equalTo(profileFooterView.snp_bottom)
            make.left.equalTo(profileFooterView.snp_left).offset(MalaLayout_FontSize_12)
            make.right.equalTo(profileFooterView.snp_right).offset(-MalaLayout_FontSize_12)
            make.height.equalTo(37)
        }
    }
    
    ///  更新本地AvatarView的图片
    ///
    ///  - parameter completion: 完成闭包
    private func updateAvatar(completion:() -> Void) {
        if let avatarURLString = MalaUserDefaults.avatar.value {
            
            println("avatarURLString: \(avatarURLString)")

            profileHeaderView.avatarURL = avatarURLString
//            let avatarSize = MalaConfig.editProfileAvatarSize()
//            let avatarStyle: AvatarStyle = .RoundedRectangle(size: CGSize(width: avatarSize, height: avatarSize), cornerRadius: avatarSize * 0.5, borderWidth: 0)
//            let plainAvatar = PlainAvatar(avatarURLString: avatarURLString, avatarStyle: avatarStyle)
//            avatarImageView.navi_setAvatar(plainAvatar, withFadeTransitionDuration: avatarFadeTransitionDuration)
            
            completion()
        }
    }
    
    
    // MARK: - DataSource
    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return model.count
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return model[section].count
    }
    
    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier(ProfileViewTableViewCellReuseID, forIndexPath: indexPath) as! ProfileViewCell
        cell.model =  model[indexPath.section][indexPath.row]
        // Section的最后一个Cell隐藏分割线
        if (indexPath.row+1) == model[indexPath.section].count {
            cell.hideSeparator()
        }
        return cell
    }
    
    
    // MARK: - Delegate
    override func tableView(tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let view = UIView(frame: CGRect(x: 0, y: 0, width: 0, height: 8))
        view.backgroundColor = MalaColor_F2F2F2_0
        return view
    }
    
    override func tableView(tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return 8
    }
    
    override func tableView(tableView: UITableView, heightForFooterInSection section: Int) -> CGFloat {
        return 0.01
    }
    
    override func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 44
    }
    
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let cell = tableView.cellForRowAtIndexPath(indexPath) as! ProfileViewCell
        let model = cell.model
        // 跳转到对应的ViewController
        if let type = model.controller as? UIViewController.Type {
            let viewController = type.init()
            viewController.title = model.controllerTitle
            (viewController as? InfoModifyViewController)?.infoType = model.type
            (viewController as? InfoModifyViewController)?.defaultString = model.detail
            viewController.hidesBottomBarWhenPushed = true
            self.navigationController?.pushViewController(viewController, animated: true)
        }
    }

    override func scrollViewDidScroll(scrollView: UIScrollView) {
        let displacement = scrollView.contentOffset.y
        
        // 向下滑动页面时，使顶部图片跟随放大
        if displacement < 0 && headerBackground.superview != nil{
            headerBackground.snp_updateConstraints(closure: { (make) -> Void in
                make.top.equalTo(0).offset(displacement)
                // 1.1为放大速率
                make.height.equalTo(MalaLayout_ProfileHeaderViewHeight + abs(displacement)*1.1)
            })
        }
    }
    
    ///  HeaderView头像点击事件
    ///
    ///  - parameter sender: UIImageView对象
    func avatarViewDidTap(sender: UIImageView) {
        
        // 准备ActionSheet选择[拍照]或[选择照片]
        let alertController = UIAlertController(title: nil, message: nil, preferredStyle: .ActionSheet)
        
        // 设置Action - 选择照片
        let choosePhotoAction: UIAlertAction = UIAlertAction(title: "选择照片", style: .Default) { (action) -> Void in
        
            let openCameraRoll: ProposerAction = { [weak self] in
                
                guard UIImagePickerController.isSourceTypeAvailable(.PhotoLibrary) else {
                    self?.alertCanNotAccessCameraRoll()
                    return
                }
                
                if let strongSelf = self {
                    strongSelf.imagePicker.sourceType = .PhotoLibrary
                    strongSelf.presentViewController(strongSelf.imagePicker, animated: true, completion: nil)
                }
            }
            
            proposeToAccess(.Photos, agreed: openCameraRoll, rejected: {
                self.alertCanNotAccessCameraRoll()
            })
            
        }
        alertController.addAction(choosePhotoAction)
        
        // 设置Action - 拍照
        let takePhotoAction: UIAlertAction = UIAlertAction(title: "拍照", style: .Default) { (action) -> Void in
            
            let openCamera: ProposerAction = { [weak self] in
                
                guard UIImagePickerController.isSourceTypeAvailable(.Camera) else {
                    self?.alertCanNotOpenCamera()
                    return
                }
                
                if let strongSelf = self {
                    strongSelf.imagePicker.sourceType = .Camera
                    strongSelf.presentViewController(strongSelf.imagePicker, animated: true, completion: nil)
                }
            }
            
            proposeToAccess(.Camera, agreed: openCamera, rejected: {
                self.alertCanNotOpenCamera()
            })
            
        }
        alertController.addAction(takePhotoAction)
        
        // 设置Action - 取消
        let cancelAction: UIAlertAction = UIAlertAction(title: "取消", style: .Cancel) { action -> Void in
            self.dismissViewControllerAnimated(true, completion: nil)
        }
        alertController.addAction(cancelAction)
        
        // 弹出ActionSheet
        self.presentViewController(alertController, animated: true, completion: nil)
    }
    
    func imagePickerController(picker: UIImagePickerController, didFinishPickingImage image: UIImage, editingInfo: [String : AnyObject]?) {
        
        defer {
            dismissViewControllerAnimated(true, completion: nil)
        }
        
        // 开启头像刷新指示器
        profileHeaderView.refreshAvatar = true
        
        // 处理图片尺寸和质量
        let image = image.largestCenteredSquareImage().resizeToTargetSize(MalaConfig.avatarMaxSize())
        let imageData = UIImageJPEGRepresentation(image, MalaConfig.avatarCompressionQuality())
        
        if let imageData = imageData {
            
            updateAvatarWithImageData(imageData, failureHandler: { (reason, errorMessage) in
                
                defaultFailureHandler(reason, errorMessage: errorMessage)
                
                dispatch_async(dispatch_get_main_queue()) { [weak self] in
                    self?.profileHeaderView.refreshAvatar = false
                }
                
                }, completion: { newAvatarURLString in
                    dispatch_async(dispatch_get_main_queue()) {
                        
                        getAndSaveProfileInfo()
//                        MalaUserDefaults.avatar.value = newAvatarURLString
                        
                        dispatch_async(dispatch_get_main_queue()) { [weak self] in
                            self?.profileHeaderView.avatar = UIImage(data: imageData) ?? UIImage()
                        }
                        
                        println("newAvatarURLString: \(newAvatarURLString)")
                        
                        self.updateAvatar() {
                            dispatch_async(dispatch_get_main_queue()) { [weak self] in
                                self?.profileHeaderView.refreshAvatar = false
                            }
                        }
                    }
            })
        }
    }
    
    
    
    // MARK: - Event Response
    @objc private func logoutButtonDidTap() {
        MalaAlert.confirmOrCancel(
            title: "麻辣老师",
            message: "确认退出当前账号吗？",
            confirmTitle: "退出登录",
            cancelTitle: "取消",
            inViewController: self,
            withConfirmAction: { () -> Void in
                
                unregisterThirdPartyPush()
                cleanCaches()
                MalaUserDefaults.cleanAllUserDefaults()
                
                if let appDelegate = UIApplication.sharedApplication().delegate as? AppDelegate {
                    appDelegate.switchToStart()
                }
                
            }, cancelAction: { () -> Void in
        })
    }
}