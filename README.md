# 使用

## 注意

1. 项目根目录：DL-VIS/
2. 根目录和front-end/要通过npm安装依赖
3. back-end/要构建虚拟环境，安装依赖（见back-end/README.md）
4. 看看有什么命令可以跑：`npm run`
5. 开前、后端：`npm run start`
6. 跑前后端测试：`npm run test`
7. 代码检查 & 格式化：`npm run lint`
8. 生成版本日志（**一般用于master分支**）：`npm run changelog`

## 前端

1. 启动dev模式：`npm run start:client`
2. 跑测试：`npm run test:client`
3. 代码检查 & 格式化: `npm run lint:client`
4. 构建：`npm run build:client`

## 后端

启动服务：
进入back-end
`python manage.py runserver --logdir logs`



## 部署

docker build .\front-end -t dl-vis-frontend:0.1  
docker build .\back-end -t dl-vis-backend:0.1  
docker-compose up  

# 代码提交注意事项

https://www.yuque.com/wulx3t/project/npp0cb