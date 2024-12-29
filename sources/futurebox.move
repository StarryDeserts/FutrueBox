module futurebox::futurebox {
    use sui::event;
    use std::string::{Self, String, to_ascii};
    use sui::display::{Self, update_version};
    use sui::table_vec::{Self, TableVec};
    use sui::url::{Url, new_unsafe};

    // Box内容类型常量定义
    const TEXT_TYPE: u8 = 0;
    const IMAGE_TYPE: u8 = 1;
    const TEXT_AND_IMAGE_TYPE: u8 = 2;

    // 小批量阈值
    const SMALL_BATCH_THRESHOLD: u64 = 10;
    // 批次大小
    const BATCH_SIZE: u64 = 30;

    //错误码定义
    const ERR_INVALID_CONTENT: u64 = 1;
    const ERR_POOL_IS_NOT_OPEN: u64 = 2;
    const ERR_POOL_IS_NOT_LOCK: u64 = 3;
    const ERR_POOL_IS_EMPTY: u64 = 4;
    const ERR_POOL_NOT_EMPTY: u64 = 5;
    const ERR_POOL_IS_NOT_UNLOCK: u64 = 6;
    const ERROR_NO_BOX_FOUND: u64 = 7;

    public struct FUTUREBOX has drop {}

    //box content type 常量定义
    public enum BoxContentType has store, copy, drop {
        Text,
        Image,
        TextAndImage
    }

    // Box的结构体
    public struct FutureBox has key, store {
        id: UID,
        name: String,
        description: String,
        content_type: BoxContentType,
        text_content: Option<String>,
        image_url: Option<Url>,
        owner_address: address
    }

    // Box的管理者结构体
    public struct ManagerCap has key, store { id: UID }

    fun init(otw: FUTUREBOX, ctx:&mut TxContext) {
        // 发布者声明，一次性见证
        let publisher = sui::package::claim(otw, ctx);
        // 设置dispaly的内容
        let mut display = display::new<FutureBox>(&publisher, ctx);
        display.add(string::utf8(b"name"), string::utf8(b"{name}"));
        display.add(string::utf8(b"description"), string::utf8(b"{description}"));
        display.add(string::utf8(b"content_type"), string::utf8(b"{content_type}"));
        display.add(string::utf8(b"text_content"), string::utf8(b"{text_content}"));
        display.add(string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display.add(string::utf8(b"owner_address"), string::utf8(b"{owner_address}"));
        update_version(&mut display);

        // 管理员权限创建，生成唯一的id
        let manager_cap = ManagerCap{id: object::new(ctx)};

        /*对象转移
        发布者权限转移给发送者
        disaplay转移给发送者
        管理员权限转移给发送者
        */
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(publisher, sender);
        transfer::public_transfer(display, sender);
        transfer::public_transfer(manager_cap, sender);
    }

    // 公共池子的结构体
    public struct Box_PublicPool has key, store {
        id: UID,
        boxes: TableVec<FutureBox>,
        num_boxes: u64,
        staus: PoolStatus,
        address_list: vector<address>,
        description: String
    }

    //池子状态常量定义
    public enum PoolStatus has store, copy, drop {
        Open,
        Lock,
        Unlock,
    }

    // 创建新的公共池子
    entry fun create_boxes_pool(
        _manager_cap: &ManagerCap,
        description: String,
        ctx: &mut TxContext,
    ) {
        let box_pool = Box_PublicPool {
            id: object::new(ctx),
            boxes: table_vec::empty(ctx),
            num_boxes: 0,
            staus: PoolStatus::Open,
            address_list: vector::empty<address>(),
            description
        };

        transfer::share_object(box_pool);
    }

    // 创建一个新的 single_box
    entry fun create_single_box(
        name: String,
        description: String,
        content_type: u8,
        content: String,
        ctx: &mut TxContext,
    ) {
        // 检查内容类型是否有效
        assert!(content_type == TEXT_TYPE || content_type == IMAGE_TYPE, ERR_INVALID_CONTENT);
        // 创建一个新的Box
        // 1. 当 content_type 为 TEXT_TYPE 时，创建一个包含文本内容的 Box
        if (content_type == TEXT_TYPE) {
            let future_box = FutureBox {
                id: object::new(ctx),
                name,
                description,
                content_type: BoxContentType::Text,
                text_content: option::some<String>(content),
                image_url: option::none<Url>(),
                owner_address: tx_context::sender(ctx)
            };
            // 发布一个创建Text_Box的事件
            let create_text_box_event = CreateSingleBoxEvent {
                id: object::id(&future_box),
                name: future_box.name,
                description: future_box.description,
                content,
                owner_address: future_box.owner_address
            };
            event::emit(create_text_box_event);
            transfer::public_transfer(future_box, tx_context::sender(ctx));
        }else if (content_type == IMAGE_TYPE) {
            // 2. 当 content_type 为 IMAGE_TYPE 时，创建一个包含图片的 Box
            let url = new_unsafe(to_ascii(content));
            let future_box = FutureBox {
                id: object::new(ctx),
                name,
                description,
                content_type: BoxContentType::Image,
                text_content: option::none<String>(),
                image_url: option::some<Url>(url),
                owner_address: tx_context::sender(ctx)
            };
            // 发布一个创建Image_Box的事件
            let create_image_box_event = CreateSingleBoxEvent {
                id: object::id(&future_box),
                name: future_box.name,
                description: future_box.description,
                content,
                owner_address: future_box.owner_address
            };
            event::emit(create_image_box_event);
            transfer::public_transfer(future_box, tx_context::sender(ctx));
        }
    }

    // 创建一个新的 complete_box
    entry fun create_complete_box(
        name: String,
        description: String,
        content_type: u8,
        text_content: String,
        image_url: String,
        ctx: &mut TxContext,
    ) {
        // 检查内容类型是否有效
        assert!(content_type == TEXT_AND_IMAGE_TYPE, ERR_INVALID_CONTENT);
        // 创建一个新的Box
        let url = new_unsafe(to_ascii(image_url));
        let future_box = FutureBox {
            id: object::new(ctx),
            name,
            description,
            content_type: BoxContentType::TextAndImage,
            text_content: option::some<String>(text_content),
            image_url: option::some<Url>(url),
            owner_address: tx_context::sender(ctx)
        };
        // 发布一个创建TextAndImage_Box的事件
        let create_text_and_image_box_event = CreateCompleteBoxEvent {
            id: object::id(&future_box),
            name: future_box.name,
            description: future_box.description,
            text_content,
            image_url,
            owner_address: future_box.owner_address
        };
        event::emit(create_text_and_image_box_event);
        transfer::public_transfer(future_box, tx_context::sender(ctx));
    }

    // 创造单一 box 事件的结构体
    public struct CreateSingleBoxEvent has copy, drop {
        id: ID,
        name: String,
        description: String,
        content: String,
        owner_address: address
    }

    // 创造完全 box 事件的结构体
    public struct CreateCompleteBoxEvent has copy, drop {
        id: ID,
        name: String,
        description: String,
        text_content: String,
        image_url: String,
        owner_address: address
    }

    // 向池子中存入Box
    entry fun deposit_box(
        boxes_pool: &mut Box_PublicPool,
        mut box: FutureBox,
        ctx: &TxContext
    ) {
        // 检查池子状态是否为开放状态
        assert!(boxes_pool.staus == PoolStatus::Open, ERR_POOL_IS_NOT_OPEN);
        // 更新Box数量
        boxes_pool.num_boxes = boxes_pool.num_boxes + 1;
        let sender = tx_context::sender(ctx);
        // 更新Box的所有者地址
        if (box.owner_address != sender) {
            box.owner_address = sender;
        };
        // 检查Box的所有者是否在池子的地址列表中
        if (!vector::contains(&boxes_pool.address_list, &sender)) {
            vector::push_back(&mut boxes_pool.address_list, sender);
        };
        // 将Box存入池子中
        table_vec::push_back(&mut boxes_pool.boxes, box);
    }

    // lock 池子
    entry fun lock_boxes_pool(
        _manager_cap: &ManagerCap,
        boxes_pool: &mut Box_PublicPool
    ) {
        // 检查池子状态是否为开放状态
        assert!(boxes_pool.staus == PoolStatus::Open, ERR_POOL_IS_NOT_OPEN);
        // 更新池子状态为锁定状态
        boxes_pool.staus = PoolStatus::Lock;
    }

    // unlock 池子
    entry fun unlock_boxes_pool(
        _manager_cap: &ManagerCap,
        boxes_pool: &mut Box_PublicPool
    ) {
        // 检查池子状态是否为上锁状态
        assert!(boxes_pool.staus == PoolStatus::Lock, ERR_POOL_IS_NOT_LOCK);
        // 空池子不需要锁定
        assert!(boxes_pool.num_boxes > 0, ERR_POOL_IS_EMPTY);
        // 更新池子状态为解锁状态
        boxes_pool.staus = PoolStatus::Unlock;
    }

    // 安全的关闭池子
    entry fun close_boxes_pool(
        _manager_cap: &ManagerCap,
        boxes_pool: Box_PublicPool
    ) {
        // 确保池子为空
        assert!(boxes_pool.num_boxes == 0, ERR_POOL_NOT_EMPTY);

        let Box_PublicPool {
            id,
            boxes,
            num_boxes:_,
            staus:_,
            address_list:_,
            description:_
        } = boxes_pool;

        // 销毁池子中的所有Box
        table_vec::destroy_empty(boxes);
        // 销毁池子
        object::delete(id);
    }

    // 从池子中一次性批量取出所有 Box, 并将其发还给原有的所有者
    entry fun withdraw_all_boxes(
        _manager_cap: &ManagerCap,
        boxes_pool: &mut Box_PublicPool
    ) {
        // 检查池子状态是否为解锁状态
        assert!(boxes_pool.staus == PoolStatus::Unlock, ERR_POOL_IS_NOT_UNLOCK);
        // 检查池子中是否有足够的Box
        assert!(boxes_pool.num_boxes > 0, ERR_POOL_IS_EMPTY);
        // 获取池子中的Box数量
        let count = boxes_pool.num_boxes;
        // 检查池子中的Box数量是否小于等于 SMALL_BATCH_THRESHOLD, 如果是则使用正常方法直接取出所有Box
        if (boxes_pool.num_boxes <= SMALL_BATCH_THRESHOLD) {
            while (boxes_pool.num_boxes > 0) {
                // 从池子中取出一个Box
                let box = table_vec::pop_back(&mut boxes_pool.boxes);
                // 将Box发还给原有的所有者
                let owner = box.owner_address;
                transfer::public_transfer(box, owner);
                // 更新Box数量
                boxes_pool.num_boxes = boxes_pool.num_boxes - 1;
            };
        } else {
            // 如果池子中的Box数量大于 SMALL_BATCH_THRESHOLD, 则使用批量取出的方法取出所有Box
            let mut current_batch = vector::empty<FutureBox>();
            while (boxes_pool.num_boxes > 0) {
                let mut i = 0;
                // 每次取出 BATCH_SIZE 个Box 放入到 current_batch 中
                while (i < BATCH_SIZE && boxes_pool.num_boxes > 0) {
                    // 从池子中取出一个Box
                    let box = table_vec::pop_back(&mut boxes_pool.boxes);
                    // 将Box添加到当前批次中
                    vector::push_back(&mut current_batch, box);
                    i = i + 1;
                };
                // 处理当前批次的Box
                process_batch(&mut current_batch, boxes_pool);
            };
            // 安全销毁空的 current_batch 向量
            vector::destroy_empty(current_batch);
        };
        // 发布一个取出Box的事件
        let withdraw_all_box_event = WithdrawAllBoxEvent {
            id: object::id(boxes_pool),
            description: boxes_pool.description,
            remaining_quantity: count,
            owner_address_list: boxes_pool.address_list
        };
        event::emit(withdraw_all_box_event);
    }

    // 取出所有 box 的事件结构
    public struct WithdrawAllBoxEvent has copy, drop {
        id: ID,
        description: String,
        remaining_quantity: u64,
        owner_address_list: vector<address>
    }

    // 处理当前批次的Box
    public(package) fun process_batch(
        batch: &mut vector<FutureBox>,
        boxes_pool: &mut Box_PublicPool,
    ) {
        // 批量转移当前批次的Box
        while (!vector::is_empty(batch)) {
            let box = vector::pop_back(batch);
            // 将Box发还给原有的所有者
            let owner = box.owner_address;
            transfer::public_transfer(box, owner);
            // 更新Box数量
            boxes_pool.num_boxes = boxes_pool.num_boxes - 1;
        };
    }

    // 解锁后，所有者可以取回自己的box
    entry fun withdraw_box(
        boxes_pool: &mut Box_PublicPool,
        ctx: &TxContext
    ) {
        // 检查池子状态是否为解锁状态
        assert!(boxes_pool.staus == PoolStatus::Unlock, ERR_POOL_IS_NOT_UNLOCK);
        // 检查池子中是否有足够的Box
        assert!(boxes_pool.num_boxes > 0, ERR_POOL_IS_EMPTY);
        // 获取发送者地址
        let sender = tx_context::sender(ctx);
        let mut i = 0;
        let mut length = table_vec::length(&boxes_pool.boxes);
        let mut found_count = 0;
        // 创建一个空的Box列表，用于存放后续发送者的在池子中所属的Box
        let mut user_boxes = vector::empty<FutureBox>();
        // 记录所有找到的 box 的 ObjectID
        let mut box_ids = vector::empty<ID>();

        // 单次遍历池子中的所有Box收集当前调用者所有的Box
        while (i < length) {
            // 检查当前 Box 的所有者是否为发送者
            let box = table_vec::borrow(&boxes_pool.boxes, i);
            if (box.owner_address == sender) {
                // 记录所有找到的 box 的 ObjectID
                vector::push_back(&mut box_ids, object::id(box));
                // 使用swap_remove方法将当前 Box 从池子中移除，并将其添加到 user_boxes 列表中
                vector::push_back(&mut user_boxes, table_vec::swap_remove(&mut boxes_pool.boxes, i));
                // 更新 Box 数量
                boxes_pool.num_boxes = boxes_pool.num_boxes - 1;
                // 更新找到的 Box 数量
                found_count = found_count + 1;
                // 因为用了 swap_remove，当前位置现在是新元素，长度减一
                length = length - 1;
            } else {
                // 当前 Box 不属于调用者，继续遍历下一个 Box
                i = i + 1;
            }
        };

        // 确保找到了至少一个 box
        assert!(found_count > 0, ERROR_NO_BOX_FOUND);

        // 批量转移找到的 Box
        while (!vector::is_empty(&user_boxes)) {
            let box = vector::pop_back(&mut user_boxes);
            transfer::public_transfer(box, sender);
        };

        // 安全销毁空的 Box 向量
        vector::destroy_empty(user_boxes);

        // 发布一个取出 Box 的事件
        let withdraw_box_event = BoxesWithdrawn {
            boxes_id: box_ids,
            count: found_count,
            owner_address: sender
        };
        event::emit(withdraw_box_event);
    }

    public struct BoxesWithdrawn has copy, drop {
        boxes_id: vector<ID>,
        count: u64,
        owner_address: address
    }

    // 只读方法，前端展示

    /* 获取 Box 相关信息 */
    // 获取 Box 的名称
    public fun get_box_name(box: &FutureBox): String {
        box.name
    }
    // 获取 Box 的描述
    public fun get_box_description(box: &FutureBox): String {
        box.description
    }
    // 获取 Box 的内容类型
    public fun get_box_content_type(box: &FutureBox): u8 {
        match (box.content_type) {
            BoxContentType::Text => TEXT_TYPE,
            BoxContentType::Image => IMAGE_TYPE,
            BoxContentType::TextAndImage => TEXT_AND_IMAGE_TYPE
        }
    }
    // 获取 Box 的文本内容
    public fun get_box_text_content(box: &FutureBox): Option<String> {
        box.text_content
    }
    // 获取 Box 的图片链接
    public fun get_box_image_url(box: &FutureBox): Option<Url> {
        box.image_url
    }
    // 获取 Box 的所有者地址
    public fun get_box_owner_address(box: &FutureBox): address {
        box.owner_address
    }

    /* 获取 BoxPool 相关信息 */
    // 获取 BoxPool 的描述
    public fun get_box_pool_description(box_pool: &Box_PublicPool): String {
        box_pool.description
    }
    // 获取 BoxPool 的状态
    public fun get_box_pool_status(box_pool: &Box_PublicPool): PoolStatus {
        box_pool.staus
    }
    // 获取 BoxPool 的 Box 数量
    public fun get_box_pool_num_boxes(box_pool: &Box_PublicPool): u64 {
        box_pool.num_boxes
    }
    // 获取 BoxPool 的地址列表
    public fun get_box_pool_address_list(box_pool: &Box_PublicPool): vector<address> {
        box_pool.address_list
    }

}





