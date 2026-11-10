<?php

namespace app\command;

use app\common\lib\Uploads;
use app\common\lib\Util;
use GuzzleHttp\Client;
use think\console\Command;
use think\console\Input;
use think\console\input\Argument;
use think\console\Output;
use think\Exception;
use think\facade\Db;
use think\facade\Env;
use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;
use Intervention\Image\ImageManager;
class SaveS3 extends Command {

    protected function configure() {
        $this->setName('saves3')->setDescription('上传图片到S3')
            ->addArgument("type", Argument::OPTIONAL, '方法，默认s3', 's3')
            ->addArgument("arg", Argument::OPTIONAL, '参数')
            ->setDescription('public task');
    }
    protected function execute(Input $input, Output $output) {
        $type = $input->getArgument('type');
        if (method_exists($this, $type)) {
            $this->{$type}($input, $output);
        } else {
            $output->info("type 错误: {$type}");
        }
    }

    protected function s3(Input $input, Output $output) {
        $list = Db::name('games')->where('g_icon', "<>", "")->whereNotLike('g_icon', "https://%")->select();
        if (!empty($list)) {
            $uploader = new Uploads();
            $curr = 1;
            $total = count($list);
            foreach ($list as $item) {
                echo "{$curr}/{$total};";
                $logo = toMedia($item['g_icon'], 2);
                if (!file_exists($logo)) {
                    $curr++;
                    $output->info($item['g_icon']);
                    continue;
                }
                $p = pathinfo($item['g_icon']);
                $name = strtolower(Util::random(16));
                $key = "storage/" . $p['dirname'] . "/{$name}.{$p['extension']}";
                $url = $uploader->uploadS3($logo, $key);
                if ($url) {
                    Db::name('games')->where('g_id', $item['g_id'])->update([
                        'g_icon' => $url,
                    ]);
                    Db::name('game_infos')->where('gi_gid', $item['g_id'])->update([
                        'gi_headimg' => $url,
                    ]);
                    $output->info($url);
                }else{
                    $output->error($item['g_icon']);
                }
                $curr++;
            }
        }
        $output->info("done！");
    }
    
    public function save($key) {
        $s3_config = [
            'version' => 'latest',
            'region' => Env::get('S3.REGION'),
            'credentials' => [
                'key' => Env::get('S3.CREDENTIALS_KEY'),
                'secret' => Env::get('S3.CREDENTIALS_SECRET'),
            ],
        ];
        $s3_bucket = Env::get('S3.BUCKET');
        $file_path = toMedia($key, '/', 2);
        if (file_exists($file_path)) {
            return true;
        }
        $pathinfo = pathinfo($file_path);
        if (!file_exists($pathinfo['dirname'])) {
            $a = mkdir($pathinfo['dirname']);
        }
        if ($s3_bucket && isset($s3_config['credentials']['key']) && $s3_config['credentials']['key'] != '') {
            $s3 = S3Client::factory($s3_config);
            try {
                $result = $s3->getObject([
                    'Bucket' => $s3_bucket,
                    'Key' => ltrim($key, '/'),
                ]);

                file_put_contents($file_path, $result['Body']);
            } catch (S3Exception $e) {
                echo $e->getMessage();
                return false;
            }
        }
        
        return true;
    }

    protected function image(Input $input, Output $output) {
        $arg = $input->getArgument('arg');
        $args = explode('-', $arg);
        if (count($args) != 4) {
            throw new Exception("参数格式:图片目录-输出目录-新图片宽-新图片高");
        }
        $src_dir = public_path($args[0]);
        $dst_dir = public_path($args[1]);
        $new_width = $args[2]; // 564
        $new_height = $args[3];// 737
        $output->info("{$src_dir}-{$dst_dir}-{$new_width}-{$new_height}");
//        return;
        $handler = opendir($src_dir);
        while (($filename = readdir($handler)) !== false) {//务必使用!==，防止目录下出现类似文件名“0”等情况
            if ($filename != "." && $filename != "..") {
                $p = pathinfo($filename);
                if (isset($p['extension']) && in_array($p['extension'], ['jpg', 'png', 'webp'])) {
                    $src_file = rtrim($src_dir, '/') . "/{$filename}";
                    $dst_file = rtrim($dst_dir, '/') . "/{$filename}";
                    $this->resetImg($src_file, $dst_file, $new_width, $new_height);
                    $output->info($dst_file);
                }
            }
        }
        closedir($handler);

        $output->info('done!');
    }

    protected function resetImg($src_file, $dst_file, $new_width, $new_height) {
        $w_rate = $new_width / $new_height;
        $manager = new ImageManager(['driver' => 'gd']);
        $img = $manager->make($src_file);
        $old_width = $img->getWidth();
        $old_height = $img->getHeight();
        if ($old_width >= $old_height) {
            $new_width2 = $old_width;
            $new_height2 = round($old_width / $w_rate);
        } else {
            $new_height2 = $old_height;
            $new_width2 = round($old_height * $w_rate);
        }
//        echo "{$old_width}--{$old_height}--{$new_width}xxx{$new_height}###{$new_width2}--{$new_height2}\n";
        $img->resizeCanvas($new_width2, $new_height2);
        $img->save($dst_file);
    }

    /**
     * 同步所有图片到当前S3 图片
     * @return void
     */
    protected function syncLocalS3() {
        // 游戏图片
        $s3_domain = Env::get('S3.DOMAIN');
        $list = Db::name('games')->where('g_icon', "<>", "")->whereNotLike('g_icon', "{$s3_domain}%")->select();
        foreach ($list as $row) {
            $new_url = $this->download($row['g_icon']);
            if ($new_url && $new_url != $row['g_icon']) {
                $ret = Db::name('games')->where('g_id', $row['g_id'])->update(['g_icon' => $new_url]);
                Db::name('game_infos')->where('gi_gid', $row['g_id'])->update(['gi_headimg' => $new_url]);
                $this->output->writeln("更新:{$row['g_id']}->{$ret}");
            }
        }
        $list = Db::name('lang_item_detail')->select();
        foreach ($list as $row) {
                $pattern = '/^(https?:\/\/).*(jpg|png|gif|jpeg)$/i';
                if (preg_match($pattern, $row['text']) && !strexists($row['text'], $s3_domain)) {
                    $new_url = $this->download($row['text']);
                    if ($new_url && $new_url != $row['text']) {
                        $ret = Db::name('lang_item_detail')->where('id', $row['id'])->update(['text' => $new_url]);
                        $this->output->writeln("更新:{$row['id']}->{$ret}");
                    }
                }
        }

        $tables = [
            ['name' => 'banner', 'pk' => 'id', 'field' => 'img'],
            ['name' => 'news', 'pk' => 'id', 'field' => 'news_images'],
            ['name' => 'news', 'pk' => 'id', 'field' => 'first_recharge_images'],
            ['name' => 'news', 'pk' => 'id', 'field' => 'recharge_images'],
            ['name' => 'journalism', 'pk' => 'id', 'field' => 'pic'], // content需要特殊处理
            ['name' => 'lang', 'pk' => 'id', 'field' => 'flag'],
            ['name' => 'nation', 'pk' => 'id', 'field' => 'flag'],
            ['name' => 'fake_game_set', 'pk' => 'id', 'field' => 'game_icon'],
            ['name' => 'game_set', 'pk' => 'id', 'field' => 'icon'],
            ['name' => 'game_type', 'pk' => 'id', 'field' => 'icon'],
            ['name' => 'lottery_prize', 'pk' => 'id', 'field' => 'pic'],
            ['name' => 'lottery_config', 'pk' => 'id', 'field' => 'img'],
            ['name' => 's_lottery', 'pk' => 'id', 'field' => 'icon'],
            ['name' => 'service', 'pk' => 'id', 'field' => 'img'],
            ['name' => 'third_configs', 'pk' => 'tc_id', 'field' => 'icon'],
            ['name' => 'third_configs', 'pk' => 'tc_id', 'field' => 'simple_icon'],
            ['name' => 'third_set', 'pk' => 'id', 'field' => 'icon'],
            ['name' => 'user_offline', 'pk' => 'id', 'field' => 'credentials'],
            ['name' => 'pay_set', 'pk' => 'id', 'field' => 'icon'],
            ['name' => 'liansai_team', 'pk' => 'id', 'field' => 'logo'],
            ['name' => 'games', 'pk' => 'g_id', 'field' => 'g_icon'],
            ['name' => 'game_infos', 'pk' => 'gi_id', 'field' => 'gi_headimg'],
            ['name' => 'lang_item_detail', 'pk' => 'id', 'field' => 'text'],
            ['name' => 'user_level', 'pk' => 'id', 'field' => 'image'],
            ['name' => 'sys_sets', 'pk' => 'set_id', 'field' => 'set_value'],
        ];
        foreach ($tables AS $t) {
            $this->syncTable($t['name'], $t['pk'], $t['field']);
        }
    }

    protected function syncTable($table_name, $pk, $field) {
        $s3_domain = Env::get('S3.DOMAIN');
        $list = Db::name($table_name)->where($field, "<>", "")->whereNotLike($field, "{$s3_domain}%")->select();
        foreach ($list as $row) {
            $new_url = $this->download($row[$field]);
            if ($new_url && $new_url != $row[$field]) {
                $ret = Db::name($table_name)->where($pk, $row[$pk])->update([$field => $new_url]);
                $this->output->writeln("更新:{$row[$pk]}->{$ret}");
            }
        }
    }

    protected function download($url) {
        $client = new Client();
        $root_path = \think\facade\Env::get('root_path');
        $s3url = $url;
        try {
            $pi = parse_url($url);
            $sink = public_path() . ltrim($pi['path'], '/');
            $path = pathinfo($sink);
            if (!is_dir($path['dirname'])) {
                mkdir($path['dirname'], 0777, true);
            }
            $client->request('GET', trim($url), ['sink' => $sink]);
            $uploader = new Uploads();
            $s3url = $uploader->uploadS3($sink, ltrim($pi['path'], '/'));
            $this->output->writeln($sink . "===ok-");
            $this->output->writeln($url . "--old===ok-");
            $this->output->writeln($s3url . "--new===ok-" . Util::timeToStr());
        } catch (\Exception $exc) {
            $this->output->writeln($url . "===fail-" . Util::timeToStr() . $exc->getMessage());
        }
        $this->output->writeln("done!");
        return $s3url;
    }

}
