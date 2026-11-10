#!/bin/bash

# git仓库目录
git_path="../game95dist"
# 源码目录
source_path="../game95agent"
# 编译文件目录
dist_path="../game95agent/dist"
time=$(date "+%Y-%m-%d %H:%M:%S")

error(){
	echo "\033[31m $1 \033[0m"
    exit
}

if [ ! -n "$1" ]; then
    error "参数有误，执行命令方式为：sh web.sh test"
fi

cd $git_path

if [ $? -ne 0 ]; then
    error "dist git目录不存在：$git_path"
fi

echo `pwd`

echo '----------切换分支------------'
git checkout "$1agent"

if [ $? -ne 0 ]; then
    git checkout main
    git checkout -b "$1agent"
    if [ $? -ne 0 ]; then
        error "不存在分支：$1"
    fi
fi

echo '----------跳转到源码目录------------'
cd $source_path
echo `pwd`

echo '----------编译------------'
pnpm build --mode $1
if [ $? -ne 0 ]; then
    error "编译出错了"
fi

echo '编译成功...'
cp -rf "${dist_path}/"* $git_path

if [ $? -ne 0 ]; then
    error "移动文件出错了"
fi

echo '移动文件成功...'

cd $git_path
echo `pwd`

git add .
git commit -m "${time}"
echo '推送到git...'
git push --set-upstream origin "$1agent"

endtime=$(date "+%Y-%m-%d %H:%M:%S")
echo "${time}~${endtime}"
echo "done!"
